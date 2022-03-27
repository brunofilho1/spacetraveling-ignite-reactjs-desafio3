import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client'
import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

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
    return <div>Carregando...</div>;
  }

  const calculateReadingTime = () => {
    const wordsOfHeading = post.data.content.reduce((acc, data) => {
      if(data.heading) {
        return [...acc, ...data.heading.split(' ')];
      }

      return [...acc]
    }, []).length

    const wordsOfBody = RichText.asText(
      post.data.content.reduce((acc, data) => [...acc, ...data.body], [])
    ).split(' ').length

    const readingTime = Math.ceil((wordsOfBody + wordsOfHeading) / 200)

    return String(readingTime)
  }

  return (
    <>
      <Header />
      <main className={styles.postsMain}>
        <img src={`${post.data.banner.url}`} alt="" />
        <section className={styles.postSection}>
          <h1>{post.data.title}</h1>
          <div className={styles.postInfos}>
            <div><FiCalendar /><span>{
              format(
                new Date(post.first_publication_date),
                'dd MMM yyyy',
                {
                  locale: ptBR,
                }
              )
            }</span></div>
            <div><FiUser /><span>{post.data.author}</span></div>
            <div><FiClock /><span>{calculateReadingTime()} min</span></div>
          </div>
          <div className={styles.postContent}>
            {post.data.content.map(({heading, body}) => (
              <div key={heading}>
                <h2>{heading}</h2>
                <div
                  dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    pageSize: 2,
  });

  const paths = posts.results.map(result => {
    return {
      params: {
        slug: result.uid
      }
    }
  })

  return {
    paths,
    fallback: true // true, false, blocking
  }
};

export const getStaticProps: GetStaticProps<PostProps> = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content
    }
  }

  return {
    props: {
      post
    }
  }
};
