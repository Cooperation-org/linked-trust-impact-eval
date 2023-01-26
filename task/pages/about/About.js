/* 
Add css help of Head  Component on Specific web page 
*/

// import head component
import Head from "next/head";
//  import css
import styles from "../../styles/About.module.css";

export default function About() {
  return (
    <>
      {/* use head and add meta tag in head component  */}
      <Head>
        <title>About</title>
      </Head>
      {/* use layout and add other ui component  */}

      <div className={styles.grid}>
        <h1 className={styles.title}> About Page </h1>
        <p className={styles.paragraf}>
          The About Page..........................................
          ....................................................................
          ..............
        </p>
      </div>
    </>
  );
}
