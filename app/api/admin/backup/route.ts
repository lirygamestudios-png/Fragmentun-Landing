import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { createSupabaseServiceClient } from "../../../../lib/supabase/service";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";

const TABLES=[
  "localized_content",
  "media_assets",
  "books",
  "book_editions",
  "characters",
  "map_regions",
  "map_points",
  "test_questions",
  "test_options",
  "test_profiles",
  "reviews",
  "campaigns"
] as const;

const RECOVERY_ORDER=[
  "media_assets",
  "books",
  "book_editions",
  "characters",
  "map_regions",
  "map_points",
  "test_profiles",
  "test_questions",
  "test_options",
  "reviews",
  "campaigns",
  "localized_content"
] as const;

export async function GET(){
  const session=await createSupabaseServerClient();
  const{data:{user}}=await session.auth.getUser();
  if(!user)return NextResponse.json({error:"forbidden"},{status:403});
  if(!(await hasSatisfiedMfa(supabase)))return NextResponse.json({error:"mfa_required"},{status:403});

  const{data:profile}=await session
    .from("admin_profiles")
    .select("role")
    .eq("user_id",user.id)
    .maybeSingle();

  if(!profile||profile.role!=="admin"){
    return NextResponse.json({error:"forbidden"},{status:403});
  }

  let supabase:any=session;
  try{
    supabase=createSupabaseServiceClient();
  }catch{
    // La copia de contenido debe seguir disponible para un administrador autenticado
    // aunque el diagnóstico avanzado con clave de servicio no esté configurado.
    supabase=session;
  }
  const backup:Record<string,unknown[]|{error:string}>={};
  const counts:Record<string,number>={};
  const failures:string[]=[];

  for(const table of TABLES){
    const{data,error}=await supabase.from(table).select("*");
    if(error){
      backup[table]={error:"query_failed"};
      failures.push(table);
      counts[table]=0;
    }else{
      const rows=data||[];
      backup[table]=rows;
      counts[table]=rows.length;
    }
  }

  const mediaRows=Array.isArray(backup.media_assets)?backup.media_assets as any[]:[];
  const media_manifest=mediaRows.map((row:any)=>({
    slug:row.slug,
    kind:row.kind,
    storage_path:row.storage_path,
    public_visible:row.public_visible,
    protected:row.protected
  }));

  const generatedAt=new Date().toISOString();
  const body={
    schema_version:"2.0",
    generated_at:generatedAt,
    project:"FRAGMENTUN",
    purpose:"content_recovery",
    status:failures.length?"PARTIAL":"COMPLETE",
    table_counts:counts,
    recovery_order:[...RECOVERY_ORDER],
    includes:[...TABLES],
    excludes:[
      "leads",
      "analytics_events",
      "admin_profiles",
      "admin_access_allowlist",
      "admin_audit_log",
      "integration_logs",
      "ingress_rate_limits",
      "auth.users",
      "storage.objects",
      "secrets"
    ],
    notes:[
      "Este backup contiene contenido y metadatos restaurables, no datos personales de leads ni credenciales.",
      "Los archivos binarios de Supabase Storage no se incluyen; media_manifest conserva sus rutas para validación y recuperación.",
      "Restaurar respetando recovery_order para evitar referencias huérfanas."
    ],
    media_manifest,
    data:backup
  };

  const json=JSON.stringify(body,null,2);
  const checksum=createHash("sha256").update(json).digest("hex");
  const payload=JSON.stringify({...body,checksum_sha256:checksum},null,2);
  const stamp=generatedAt.replace(/[:.]/g,"-");

  return new NextResponse(payload,{
    headers:{
      "Content-Type":"application/json; charset=utf-8",
      "Content-Disposition":`attachment; filename="fragmentun-backup-${stamp}.json"`,
      "Cache-Control":"no-store",
      "X-Fragmentun-Backup-Status":failures.length?"partial":"complete"
    }
  });
}
