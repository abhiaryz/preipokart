import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { BlogAuthor, BlogPublishMeta } from '../components/BlogMeta';
import { blogs } from '../data/blogs';

export default function Blog() {
  const [featured, ...rest] = blogs;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 max-w-[65ch]">
        <p className="font-label-caps text-label-caps uppercase text-primary">Market notes</p>
        <h1 className="mt-2 font-headline-md text-[32px] tracking-tight text-on-surface md:text-headline-md">
          Blog / News
        </h1>
        <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
          Listed-market cues, policy, and how they relate to unlisted shares. Dummy desk copy for the landing site.
        </p>
      </header>

      {featured ? (
        <Link
          to={`/blog/${featured.slug}`}
          className="card group mb-8 grid cursor-pointer overflow-hidden p-0 transition duration-200 hover:border-outline md:grid-cols-[1.15fr_0.85fr]"
        >
          <img src={featured.cover} alt="" className="h-56 w-full object-cover md:h-full md:min-h-[280px]" />
          <div className="flex flex-col justify-between gap-6 p-5 sm:p-7">
            <div>
              <p className="font-label-caps text-label-caps uppercase text-primary">{featured.category}</p>
              <h2 className="mt-2 text-2xl font-semibold leading-snug tracking-tight text-on-surface group-hover:text-primary md:text-[28px]">
                {featured.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant sm:text-base">{featured.excerpt}</p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <BlogAuthor post={featured} />
                <BlogPublishMeta post={featured} />
              </div>
              <span className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary">
                Read story
                <ArrowRight size={16} aria-hidden="true" />
              </span>
            </div>
          </div>
        </Link>
      ) : null}

      <ul className="grid gap-6 sm:grid-cols-2">
        {rest.map((post) => (
          <li key={post.slug}>
            <Link
              to={`/blog/${post.slug}`}
              className="card group flex h-full cursor-pointer flex-col overflow-hidden p-0 transition duration-200 hover:border-outline"
            >
              <img src={post.cover} alt="" className="h-44 w-full object-cover sm:h-48" />
              <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="flex-1">
                  <p className="font-label-caps text-label-caps uppercase text-primary">{post.category}</p>
                  <h2 className="mt-1 text-lg font-semibold leading-snug text-on-surface group-hover:text-primary">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-on-surface-variant">{post.excerpt}</p>
                </div>
                <div className="space-y-2 border-t border-outline-variant/40 pt-4">
                  <BlogAuthor post={post} size="sm" />
                  <BlogPublishMeta post={post} />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
