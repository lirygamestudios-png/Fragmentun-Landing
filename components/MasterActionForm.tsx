"use client";

import type {FormHTMLAttributes,ReactNode} from "react";
import {createContext,useActionState} from "react";

type ActionResult={ok:boolean;message:string};
type ServerAction=(formData:FormData)=>Promise<unknown>;

export const MasterActionFormContext=createContext(false);

const errorMessages:Record<string,string>={
  member_identity_required:"Indica al menos el nombre o el correo del nuevo miembro.",
  member_not_found:"El miembro seleccionado ya no existe. Actualiza la página y vuelve a seleccionarlo.",
  invalid_tier:"Selecciona un nivel de miembro válido.",
  invalid_action:"Revisa el miembro, el tipo de actividad y los puntos que quieres registrar.",
  invalid_member_update:"Revisa los campos del miembro: estado, nivel, puntos, etiquetas y notas.",
  community_action_create_failed:"No se pudo registrar la actividad. Inténtalo nuevamente.",
  mfa_required:"Completa la verificación en dos pasos antes de realizar esta acción.",
  forbidden:"Tu usuario no tiene permiso para realizar esta acción.",
  admin_required:"Esta acción requiere permisos de administrador.",
  rollback_plan_required:"Debes registrar un plan de reversión antes de continuar.",
  admin_approval_required:"Esta acción necesita aprobación de un administrador.",
  member_allocation_exceeded:"La asignación supera la disponibilidad de esta persona.",
  member_not_active:"La persona seleccionada no está activa.",
  risk_close_requirements_missing:"Para cerrar el riesgo completa responsable, mitigación y control.",
  incident_owner_required:"Los incidentes altos o críticos necesitan un responsable.",
  incident_resolution_incomplete:"Para resolver el incidente completa causa raíz y remediación.",
  release_not_ready:"El lanzamiento todavía no cumple todos los requisitos para publicarse.",
  storefront_not_ready:"La plataforma seleccionada todavía no está verificada y activa.",
  target_date_required:"Debes indicar una fecha objetivo antes de continuar.",
  payment_status_managed_by_provider:"El estado de pago lo administra el procesador y no puede cambiarse manualmente.",
  refund_status_managed_by_provider:"El estado de reembolso lo administra el procesador.",
  order_must_be_paid_before_fulfillment:"El pedido debe estar pagado antes de iniciar su preparación.",
  order_must_be_paid_before_shipping:"El pedido debe estar pagado antes de marcar el envío como despachado.",
  shipping_address_incomplete:"Completa la dirección de envío antes de crear el envío.",
  production_flag_requires_release_approval:"Los controles de producción requieren el flujo de aprobación de publicación.",
  won_opportunity_incomplete:"Una oportunidad ganada debe estar cerrada como ganada y tener capital comprometido.",
  lost_opportunity_stage_mismatch:"Una oportunidad perdida debe quedar en la etapa Cerrada perdida.",
  waiver_evidence_required:"Una excepción bloqueante necesita una justificación escrita.",
  incomplete_checks_present:"No puedes cerrar la prueba como correcta mientras existan comprobaciones fallidas u omitidas.",
  blocking_checks_incomplete:"Todavía existen comprobaciones importantes pendientes o fallidas. Revísalas antes de aprobar.",
  runtime_validation_required:"Primero integra una prueba funcional correcta en esta revisión.",
  latest_validation_not_passed:"La última prueba de esta versión no terminó correctamente. Repítela antes de aprobar.",
  no_validation_available:"Todavía no existe una prueba registrada para esta versión.",
  release_deployment_mismatch:"La prueba corresponde a una versión distinta. Ejecuta nuevamente la comprobación de versión en el Preview actual.",
  release_commit_mismatch:"La prueba corresponde a un código de versión anterior. Ejecuta nuevamente la comprobación de versión en el Preview actual.",
  invalid_virtual_item:"Revisa el juego, SKU, nombre, tipo, rareza y modalidad de entrega del artículo.",
  timed_duration_required:"Los artículos temporales necesitan una duración válida mayor que cero.",
  invalid_virtual_offer:"Revisa el artículo, plataforma, precio y código de moneda de la oferta."
};

function readableError(error:unknown){
  const raw=error instanceof Error?error.message:String(error||"");
  for(const [code,message] of Object.entries(errorMessages)){
    if(raw.includes(code)) return message;
  }
  if(raw.includes("invalid_")) return "Revisa los datos ingresados. Hay uno o más valores inválidos.";
  if(raw.includes("required")) return "Falta completar uno o más datos obligatorios.";
  // No mostrar mensajes internos del motor de datos, tokens, consultas o trazas al usuario.\n  if(raw&&raw.length<180&&!/digest|server components|unexpected|postgres|supabase|permission denied|duplicate key|violates|relation |column |schema |constraint|sqlstate|pgrst|42p|23[0-9]{3}/i.test(raw)) return raw;
  return "No fue posible completar la acción. Revisa los datos e inténtalo nuevamente.";
}

type Props=Omit<FormHTMLAttributes<HTMLFormElement>,"action">&{
  action:ServerAction;
  children:ReactNode;
  successText?:string;
};

export function MasterActionForm({action,children,successText="Cambios guardados correctamente.",...props}:Props){
  const[state,formAction]=useActionState<ActionResult,FormData>(async(_previous,formData)=>{
    try{
      await action(formData);
      return {ok:true,message:successText};
    }catch(error){
      return {ok:false,message:readableError(error)};
    }
  },{ok:false,message:""});

  return <MasterActionFormContext.Provider value={true}>
    <form {...props} action={formAction}>
      {children}
      {state.message&&<div
        role={state.ok?"status":"alert"}
        aria-live="polite"
        style={{
          marginTop:"10px",
          padding:"10px 12px",
          borderRadius:"10px",
          border:state.ok?"1px solid rgba(105,211,145,.32)":"1px solid rgba(255,110,110,.34)",
          background:state.ok?"rgba(48,143,86,.13)":"rgba(180,54,54,.13)",
          color:state.ok?"#8fd3a7":"#ff9a9a",
          fontSize:".78rem",
          fontWeight:700,
          lineHeight:1.4
        }}
      >{state.ok?"✓ ":"⚠ "}{state.message}</div>}
    </form>
  </MasterActionFormContext.Provider>;
}
