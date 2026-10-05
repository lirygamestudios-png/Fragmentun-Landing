"use client";

import {useMemo,useState} from "react";
import type {Locale} from "../lib/i18n";

type Review={
  id:string;
  source:string;
  author_display:string|null;
  body:string;
  source_url:string|null;
};

export function ReviewsShowcase({locale,reviews}:{locale:Locale;reviews:Review[]}){
  const[page,setPage]=useState(0);
  const pageSize=4;
  const pages=Math.max(1,Math.ceil(reviews.length/pageSize));
  const slice=useMemo(()=>reviews.slice(page*pageSize,page*pageSize+pageSize),[reviews,page]);
  const featured=slice[0];
  const secondary=slice.slice(1,4);

  if(!reviews.length){
    return <div className="reviewAwaiting">
      <span className="reviewVerifiedBadge">{locale==="es"?"Reseñas verificadas":"Verified reviews"}</span>
      <p>{locale==="es"?"Las reseñas verificadas de lectores aparecerán aquí.":"Verified reader reviews will appear here."}</p>
    </div>;
  }

  return <div className="reviewsShowcase">
    <article className="featuredReview">
      <div className="reviewVerifiedBadge">{locale==="es"?"Reseña verificada":"Verified review"}</div>
      <blockquote>“{featured.body}”</blockquote>
      <p>{featured.author_display||(locale==="es"?"Lector verificado":"Verified reader")}</p>
      <small>{featured.source}</small>
      {featured.source_url&&<a className="reviewSource" href={featured.source_url} target="_blank" rel="noreferrer">{locale==="es"?"Ver fuente":"View source"}</a>}
    </article>

    {secondary.length>0&&<div className="reviewSecondaryGrid">
      {secondary.map(review=><article className="reviewMiniCard" key={review.id}>
        <div className="reviewVerifiedBadge">{locale==="es"?"Reseña verificada":"Verified review"}</div>
        <blockquote>“{review.body}”</blockquote>
        <p>{review.author_display||(locale==="es"?"Lector verificado":"Verified reader")}</p>
        <small>{review.source}</small>
        {review.source_url&&<a className="reviewSource" href={review.source_url} target="_blank" rel="noreferrer">{locale==="es"?"Ver fuente":"View source"}</a>}
      </article>)}
    </div>}

    {pages>1&&<div className="reviewCarouselNav" aria-label={locale==="es"?"Navegación de reseñas":"Review navigation"}>
      <button type="button" onClick={()=>setPage(p=>(p-1+pages)%pages)} aria-label={locale==="es"?"Reseñas anteriores":"Previous reviews"}>←</button>
      <span>{page+1} / {pages}</span>
      <button type="button" onClick={()=>setPage(p=>(p+1)%pages)} aria-label={locale==="es"?"Reseñas siguientes":"Next reviews"}>→</button>
    </div>}
  </div>;
}
