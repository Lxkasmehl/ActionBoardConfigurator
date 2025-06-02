import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className='container'>
        <Heading as='h1' className='hero__title'>
          {siteConfig.title}
        </Heading>
        <p className='hero__subtitle'>{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className={clsx('button button--lg', styles.button)}
            to='/docs/intro'
          >
            Get Started →
          </Link>
        </div>
      </div>
    </header>
  );
}

function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className='container'>
        <div className='row'>
          <div className='col col--6'>
            <div className={styles.feature}>
              <h2>Data Picker</h2>
              <p>
                Build complex SAP SuccessFactors data queries through an
                intuitive interface. Create visual flow diagrams, select
                entities, and filter data with ease.
              </p>
              <Link
                className={clsx('button', styles.button)}
                to='/docs/features/data-picker'
              >
                Learn More →
              </Link>
            </div>
          </div>
          <div className='col col--6'>
            <div className={styles.feature}>
              <h2>UI Builder</h2>
              <p>
                Create custom user interfaces for your SuccessFactors data. Drag
                and drop components, customize layouts, and preview in
                real-time.
              </p>
              <Link
                className={clsx('button', styles.button)}
                to='/docs/features/ui-builder'
              >
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description='A modern enterprise data visualization and UI builder platform for SAP SuccessFactors'
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
