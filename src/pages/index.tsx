import { GetStaticProps } from 'next';
import { PostLink } from '../components/PostLink';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';
import { useEffect } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    setPosts([...postsPagination.results]);
    setNextPage(postsPagination.next_page);
  }, []);

  async function handleLoadMorePosts() {
    fetch(nextPage)
      .then(response => response.json())
      .then((data: PostPagination) => {
        setPosts([...posts, ...data.results]);
        setNextPage(data.next_page);
      });
  }

  return (
    <>
      <header className={styles.header}>
        <img src="assets/icons/logo.svg" alt="logo" />
      </header>

      <main className={styles.container}>
        <div>
          {posts.map(post => (
            <PostLink
              key={post.uid}
              slug={post.uid}
              title={post.data.title}
              subtitle={post.data.subtitle}
              date={post.first_publication_date}
              author={post.data.author}
            />
          ))}
        </div>

        {nextPage !== null && (
          <button onClick={handleLoadMorePosts} className={styles.loadMore}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = (await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 3,
    }
  )) as PostPagination;

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results,
  };

  // TODO

  return {
    props: {
      postsPagination,
    },
  };
};
