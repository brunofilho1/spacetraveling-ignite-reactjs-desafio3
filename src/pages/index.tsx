import { GetStaticProps } from 'next';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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

export default function Home({ props }) {
  return (
    <>
      <Header />
      <main>
        <h1>Home</h1>
        <p>Aqui vão as {props}</p>
      </main>
    </>
  )
}

export const getStaticProps = async () => {
  // const prismic = getPrismicClient();
  // const postsResponse = await prismic.query(TODO);

  return {
    props: {
      props: 'Props'
    }
  }
};
