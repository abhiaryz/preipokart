import { Clock, User } from '@phosphor-icons/react';
import type { BlogPost } from '../data/blogs';

export function BlogAuthor({ post, size = 'md' }: { post: BlogPost; size?: 'sm' | 'md' }) {
  const avatar = size === 'sm' ? 'h-8 w-8' : 'h-11 w-11';
  return (
    <div className="flex min-w-0 items-center gap-3">
      <img
        src={post.authorImage}
        alt=""
        className={`${avatar} shrink-0 rounded-full object-cover ring-1 ring-outline-variant/50`}
      />
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 truncate text-sm font-medium text-on-surface">
          <User size={14} className="shrink-0 text-on-surface-variant" aria-hidden="true" />
          <span className="truncate">{post.author}</span>
        </p>
        <p className="truncate text-xs text-on-surface-variant">{post.authorRole}</p>
      </div>
    </div>
  );
}

export function BlogPublishMeta({ post }: { post: BlogPost }) {
  return (
    <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant sm:text-sm">
      <div className="flex items-center gap-1.5">
        <dt className="sr-only">Published</dt>
        <dd>
          <time dateTime={post.publishedAt}>
            {post.date} · {post.publishedTime}
          </time>
        </dd>
      </div>
      <div className="flex items-center gap-1.5">
        <dt className="sr-only">Time to read</dt>
        <dd className="flex items-center gap-1.5">
          <Clock size={14} aria-hidden="true" />
          {post.readMinutes} min read
        </dd>
      </div>
    </dl>
  );
}
