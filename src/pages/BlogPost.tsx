import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { BlogAuthor, BlogPublishMeta } from '../components/BlogMeta';
import { getBlog, getLatestBlogs } from '../data/blogs';

export default function BlogPost() {
  const { slug } = useParams();
  const post = slug ? getBlog(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const latest = getLatestBlogs(post.slug, 4);

  return (
    <div className="mx-auto max-w-6xl">
      <nav className="mb-6 text-sm text-on-surface-variant" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to="/blog" className="underline-offset-4 hover:text-on-surface hover:underline">
              Blog / News
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-on-surface">{post.category}</li>
        </ol>
      </nav>

      <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_18rem] lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
        <article>
          <Link to="/blog" className="btn-ghost mb-6 inline-flex min-h-11 cursor-pointer px-0 text-on-surface-variant">
            <ArrowLeft size={16} aria-hidden="true" />
            All news
          </Link>

          <p className="font-label-caps text-label-caps uppercase text-primary">{post.category}</p>
          <h1 className="mt-2 max-w-[22ch] font-display-lg text-[32px] leading-[1.12] tracking-tight text-on-surface md:text-[40px]">
            {post.title}
          </h1>
          <p className="mt-4 max-w-[62ch] text-base text-on-surface-variant">{post.excerpt}</p>

          <div className="mt-6 flex flex-col gap-4 rounded-xl border border-outline-variant/40 bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between">
            <BlogAuthor post={post} />
            <BlogPublishMeta post={post} />
          </div>

          <img
            src={post.cover}
            alt=""
            className="mt-8 h-56 w-full rounded-xl object-cover sm:h-80"
          />

          <div className="mt-8 max-w-[65ch] space-y-4 text-base leading-relaxed text-on-surface-variant">
            {post.body.map((paragraph, index) => (
              <p key={paragraph}>
                {paragraph}
                {index === 0 ? (
                  <img
                    src={post.inlineImage}
                    alt=""
                    className="my-6 h-48 w-full rounded-xl object-cover sm:h-64"
                  />
                ) : null}
              </p>
            ))}
          </div>

          <p className="mt-10 max-w-[65ch] rounded-xl border border-outline-variant/40 bg-surface-container-low p-4 text-sm text-on-surface-variant">
            Dummy article for the marketing site. This is not investment advice.{' '}
            <Link to="/explore" className="text-primary underline">
              Browse companies
            </Link>
            .
          </p>
        </article>

        <aside className="md:sticky md:top-20">
          <h2 className="font-headline-sm text-lg text-on-surface">Latest blogs</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Other notes from the desk.</p>
          <ul className="mt-4 space-y-3">
            {latest.map((item) => (
              <li key={item.slug}>
                <Link
                  to={`/blog/${item.slug}`}
                  className="card flex cursor-pointer gap-3 p-3 transition duration-200 hover:border-outline"
                >
                  <img src={item.cover} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="font-label-caps text-[10px] uppercase tracking-wide text-primary">{item.category}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-on-surface">{item.title}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {item.author} · {item.readMinutes} min
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
