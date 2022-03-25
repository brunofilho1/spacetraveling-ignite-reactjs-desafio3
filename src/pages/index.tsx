import { GetStaticProps } from 'next';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar, FiUser } from 'react-icons/fi'
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import Link from 'next/link'

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
  const [posts, setPosts] = useState(postsPagination.results)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)

  const showMorePosts = () => {
    fetch(nextPage)
    .then(res => res.json())
    .then(data => {
      console.log(data)
      const newPosts = [
        ...posts,
        ...data.results
      ]
      setNextPage(data.next_page)
      setPosts(newPosts)
    })
  }

  return (
    <>
      <Header />
        <main className={styles.postsMain}>
          <section className={styles.postsSection}>
            {posts.map(post => (
              <div key={post.uid} className={styles.post}>
                <h1>{post.data.title}</h1>
                <legend>{post.data.subtitle}</legend>
                <div className={styles.postInfos}>
                  <div><FiCalendar /><span>{post.first_publication_date}</span></div>
                  <div><FiUser /><span>{post.data.author}</span></div>
                </div>
              </div>
            ))}
            { nextPage ?
              <Link href="/">
                <a className={styles.showMoreBtn} onClick={showMorePosts}>Carregar mais posts</a>
              </Link>
            : '' }
          </section>
        </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 2,
  });

  const results = postsResponse.results.map((post): Post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: results
  }

  return {
    props: {
      postsPagination
    }
  }
};
