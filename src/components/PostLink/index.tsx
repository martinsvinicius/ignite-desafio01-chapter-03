import { parseISO, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import { FiCalendar, FiUser } from 'react-icons/fi';

import styles from './postLink.module.scss';
import Link from 'next/link';

interface PostLinkProps {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  author: string;
}

export function PostLink(props: PostLinkProps) {
  const parsedDate = parseISO(props.date);
  const formattedDate = format(parsedDate, `dd MMM yyyy`, {
    locale: pt,
  });

  return (
    <div className={styles.container}>
      <Link href={`post/${props.slug}`}>
        <a>
          <strong>{props.title}</strong>
        </a>
      </Link>
      <p>{props.subtitle}</p>

      <div>
        <time>
          <FiCalendar className={styles.icon} size={15} color="#BBBBBB" />
          {formattedDate}
        </time>
        <span>
          <FiUser className={styles.icon} size={15} color="#BBBBBB" />
          {props.author}
        </span>
      </div>
    </div>
  );
}
