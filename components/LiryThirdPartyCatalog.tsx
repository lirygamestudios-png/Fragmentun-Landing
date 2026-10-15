import type {PublicThirdPartyCard} from "../lib/games/liry-developer-publication";
import styles from "../app/lirygames/lirygames.module.css";

/** Solo recibe fichas ya filtradas en el servidor. Sin datos reales aprobados no aparece. */
export function LiryThirdPartyCatalog({games}:{games:readonly PublicThirdPartyCard[]}){
 if(!games.length)return null;
 return <section className={styles.thirdPartySection} aria-labelledby="liry-third-party-title">
  <p className={styles.kicker}>PUBLICACIONES INDEPENDIENTES AUTORIZADAS</p>
  <h3 id="liry-third-party-title">VIDEOJUEGOS DE LA COMUNIDAD</h3>
  <p>Solo se muestran títulos con autorización de publicación. Cada juego conserva su identidad y modalidad.</p>
  <div className={styles.thirdPartyGrid}>
   {games.map(game=><article key={game.slug} className={styles.thirdPartyCard}>
    <div className={styles.thirdPartyCardArt} aria-hidden="true"><span>✧</span></div>
    <div className={styles.thirdPartyCardBody}>
     <span className={styles.thirdPartyCardModel}>{game.model==="premium"?"PREMIUM":"FREEMIUM"}</span>
     <h4>{game.title}</h4>
     <p>{game.description}</p>
     <small>PUBLICACIÓN AUTORIZADA</small>
    </div>
   </article>)}
  </div>
 </section>;
}
