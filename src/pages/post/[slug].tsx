import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { parseISO, format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();
  
  if (router.isFallback) {
    return (
      <>
        <Header />
        <p>Carregando...</p>
      </>
    );
  }

  const parsedDate = parseISO(post.first_publication_date);
  const formattedDate = format(parsedDate, 'dd MMM yyyy', {
    locale: pt,
  });

  const readTime = useMemo(() => {
    if (router.isFallback) {
      return 0;
    }

    const readWordsPerMinute = 200;
    let fullContentText = '';
    
    post.data.content.forEach(postContent => {
      fullContentText += postContent.heading;
      fullContentText += RichText.asText(postContent.body);
    });

    const time = Math.ceil(fullContentText.split(/\s/g).length / readWordsPerMinute);

    return time;
  }, [post, router.isFallback]);

  return (
    <>
      <Header />

      <main className={styles.container}>
        <div className={styles.imageContainer}>
          <img src={post.data.banner.url} alt="banner" />
        </div>

        <article className={styles.post}>
          <header>
            <h1>{post.data.title}</h1>
            <div>
              <time>
                <FiCalendar className={styles.icon} size={20} color="#BBBBBB" />{' '}
                {formattedDate}
              </time>
              <span>
                <FiUser className={styles.icon} size={20} color="#BBBBBB" />{' '}
                {post.data.author}
              </span>
              <span>
                <FiClock className={styles.icon} size={20} color="#BBBBBB" /> {`${readTime} min`}
              </span>
            </div>
          </header>

          <main className={styles.content}>
            {post.data.content.map(content => (
              <div key={content.heading} className={styles.contentGroup}>
                <h2>{content.heading}</h2>

                <div
                  className={styles.groupContent}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </div>
            ))}
          </main>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 2, // posts per page
    }
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response,
    },
    revalidate: 60 * 5, // 5 minutes
  };
};
