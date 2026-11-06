import React, { useMemo, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import coreKnowledge from '../../question/cotloi.txt?raw';

interface KnowledgeBlock {
  title?: string;
  entries: string[];
}

interface KnowledgeSection {
  id: string;
  title: string;
  blocks: KnowledgeBlock[];
}

interface CoreKnowledgeViewProps {
  onBack: () => void;
}

const parseKnowledge = (source: string): KnowledgeSection[] => {
  const sections: KnowledgeSection[] = [];
  let currentSection: KnowledgeSection | undefined;
  let currentBlock: KnowledgeBlock | undefined;

  source.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || /^={5,}$/.test(line)) return;

    const mainHeading = line.match(/^(\d+)\.\s+(.+)$/);
    if (mainHeading && mainHeading[2] === mainHeading[2].toLocaleUpperCase('vi-VN')) {
      const [, number, title] = mainHeading;
      currentSection = {
        id: `core-section-${number}`,
        title,
        blocks: [],
      };
      currentBlock = undefined;
      sections.push(currentSection);
      return;
    }

    if (!currentSection) return;

    const subHeading = line.match(/^\d+\.\d+\.\s+(.+)$/);
    const isLabel = line.endsWith(':') && !line.startsWith('-');
    if (subHeading || isLabel) {
      currentBlock = {
        title: subHeading?.[1] ?? line.slice(0, -1),
        entries: [],
      };
      currentSection.blocks.push(currentBlock);
      return;
    }

    if (!currentBlock) {
      currentBlock = { entries: [] };
      currentSection.blocks.push(currentBlock);
    }
    currentBlock.entries.push(line.replace(/^-\s*/, ''));
  });

  return sections;
};

const formatEntry = (entry: string) => {
  const separatorIndex = entry.indexOf(':');
  if (separatorIndex < 1) return entry;

  return (
    <>
      <strong className="font-semibold text-slate-900 dark:text-slate-100">
        {entry.slice(0, separatorIndex)}:
      </strong>{' '}
      {entry.slice(separatorIndex + 1).trim()}
    </>
  );
};

export const CoreKnowledgeView: React.FC<CoreKnowledgeViewProps> = ({ onBack }) => {
  const [search, setSearch] = useState('');
  const sections = useMemo(() => parseKnowledge(coreKnowledge), []);
  const normalizedSearch = search.trim().toLocaleLowerCase('vi-VN');
  const visibleSections = normalizedSearch
    ? sections.filter((section) =>
        `${section.title} ${section.blocks.map((block) => `${block.title ?? ''} ${block.entries.join(' ')}`).join(' ')}`
          .toLocaleLowerCase('vi-VN')
          .includes(normalizedSearch)
      )
    : sections;
  const topicCount = sections.reduce(
    (total, section) => total + section.blocks.reduce((blockTotal, block) => blockTotal + block.entries.length, 0),
    0
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-blue-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </button>

      <header className="mb-6 border-b border-slate-200 pb-5 dark:border-slate-800 sm:mb-7 sm:pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
          Tài liệu ôn tập · Xử lý ảnh số
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Kiến thức cốt lõi
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
          Tổng hợp khái niệm trọng tâm để tra cứu và ôn tập theo chủ đề.
        </p>
        <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
          {sections.length} chủ đề <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span> {topicCount} ý cốt lõi <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span> 400 câu hỏi
        </p>
      </header>

      <div className="mt-7 grid min-w-0 gap-7 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="h-fit min-w-0 lg:sticky lg:top-24">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <label htmlFor="core-search" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Tìm trong tài liệu
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="core-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Ví dụ: Histogram, JPEG..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-950"
              />
            </div>

            <h2 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Mục lục
            </h2>
            <nav className="flex min-w-0 gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible">
              {visibleSections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-blue-950/50 dark:hover:text-blue-300 lg:text-sm"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="max-w-[180px] truncate lg:whitespace-normal">{section.title}</span>
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          {visibleSections.map((section, index) => (
            <article
              key={section.id}
              id={section.id}
              className="scroll-mt-24 min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <header className="flex items-start gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/40 sm:px-6">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="pt-1 text-base font-bold leading-6 text-slate-900 dark:text-slate-100 sm:text-lg">
                  {section.title}
                </h2>
              </header>

              <div className="space-y-5 px-5 py-5 sm:px-6">
                {section.blocks.map((block, blockIndex) => (
                  <section key={`${section.id}-block-${blockIndex}`}>
                    {block.title && (
                      <h3 className="mb-3 text-sm font-semibold text-blue-800 dark:text-blue-300">
                        {block.title}
                      </h3>
                    )}
                    <ul className={`space-y-2.5 ${section.title.includes('PHÂN BIỆT NHANH') ? 'md:grid md:grid-cols-2 md:gap-x-6 md:space-y-0' : ''}`}>
                      {block.entries.map((entry, entryIndex) => (
                        <li
                          key={`${section.id}-${blockIndex}-${entryIndex}`}
                          className="flex gap-3 py-1 text-sm leading-6 text-slate-600 dark:text-slate-300"
                        >
                          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                          <span className="min-w-0 break-words [overflow-wrap:anywhere]">{formatEntry(entry)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </article>
          ))}

          {visibleSections.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
              <Search className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 font-semibold text-slate-800 dark:text-slate-100">Không tìm thấy nội dung phù hợp</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Thử từ khóa khác để tìm trong tài liệu.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
