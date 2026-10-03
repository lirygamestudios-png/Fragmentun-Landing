type CmsMediaContent={
  image_url?:string;
  video_url?:string;
  poster_url?:string;
  image_alt?:string;
};

export function CmsSectionMedia({content,className=""}:{content?:CmsMediaContent;className?:string}){
  const video=(content?.video_url||"").trim();
  const image=(content?.image_url||"").trim();
  const poster=(content?.poster_url||image||"").trim();
  if(video){
    return <div className={`cmsSectionMedia ${className}`} aria-hidden="true">
      <video autoPlay muted loop playsInline preload="metadata" poster={poster||undefined}>
        <source src={video}/>
      </video>
    </div>;
  }
  if(image){
    return <div className={`cmsSectionMedia ${className}`} aria-hidden="true">
      <img src={image} alt={content?.image_alt||""}/>
    </div>;
  }
  return null;
}
