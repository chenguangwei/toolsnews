import React, { useState } from "react";
import {
  Archive,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Bot,
  Boxes,
  ChevronDown,
  Clock3,
  Cloud,
  Code2,
  FileText,
  Grid2X2,
  History,
  Image,
  MonitorSmartphone,
  Plus,
  Search,
  ShieldCheck,
  Star
} from "../shared/icons.js";
import { articles, categories, categoryIcons, faqAnswers, faqs } from "../data/siteData.jsx";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { PanelTitle } from "../shared/components/Layout.jsx";
import { scrollToSelector } from "../shared/utils.js";

function HomePage({ query, setQuery, activeCategory, setActiveCategory, visibleGroups, setRoute, notify, setModal, openTool }) {
  const { messages: t, categories: cat } = useI18n();
  const [showAll, setShowAll] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredGroups = visibleGroups
    .map((group) => ({
      ...group,
      tools: normalizedQuery
        ? group.tools.filter((tool) => `${tool.name}${tool.desc}${tool.tags.join("")}`.toLowerCase().includes(normalizedQuery))
        : group.tools
    }))
    .filter((group) => group.tools.length);
  const displayedGroups = showAll ? filteredGroups : filteredGroups.slice(0, 6);
  const activeGroup = activeCategory === "all" ? null : filteredGroups.find((group) => group.id === activeCategory);
  const canToggleMore = showAll || filteredGroups.length > displayedGroups.length;

  const runSearch = () => {
    if (!query.trim()) {
      notify("请输入要搜索的工具名称或关键词");
      return;
    }
    notify(filteredGroups.length ? `找到 ${filteredGroups.reduce((sum, group) => sum + group.tools.length, 0)} 个相关工具` : "没有找到相关工具");
    scrollToSelector(".contentShell");
  };

  return (
    <main>
      <Hero t={t} query={query} setQuery={setQuery} setActiveCategory={setActiveCategory} runSearch={runSearch} />
      <Stats t={t} />
      <section className="contentShell">
        <aside className="sidebar">
          <CategoryPanel t={t} cat={cat} activeCategory={activeCategory} setActiveCategory={(id) => { setActiveCategory(id); setShowAll(false); scrollToSelector(".contentShell"); }} />
          <ActionPanel icon={History} title={t.favorites} body="登录后同步收藏与使用历史" cta={t.login} onAction={() => setModal({ type: "login", title: t.login })} />
        </aside>
        <div className="toolSections">
          {activeGroup && (
            <section className="categoryLandingIntro panel">
              <span className={`groupIcon ${activeGroup.id}`}>
                {React.createElement(categoryIcons[activeGroup.id], { size: 22 })}
              </span>
              <div>
                <h2>{cat[activeGroup.id]}大全</h2>
                <p>{activeGroup.desc}。当前分类收录 {activeGroup.tools.length} 个在线工具，全部支持独立页面、移动端访问和即时使用。</p>
              </div>
            </section>
          )}
          <div className="breadcrumb">
            <span>{t.breadcrumbHome}</span>
            <span>/</span>
            <strong>{activeGroup ? cat[activeGroup.id] : t.allTools}</strong>
          </div>
          {displayedGroups.map((group) => (
            <ToolGroup
              key={group.id}
              group={group}
              cat={cat}
              t={t}
              isCondensed={activeCategory === "all" && !normalizedQuery}
              setActiveCategory={setActiveCategory}
              openTool={openTool}
            />
          ))}
          {!displayedGroups.length && <div className="emptyState panel">没有找到相关工具，请换一个关键词。</div>}
          {canToggleMore && (
            <button className="loadMore" onClick={() => { setShowAll((value) => !value); notify(showAll ? "已收起工具列表" : "已展开更多工具"); }}>
              {showAll ? "收起工具" : t.loadMore}
              <ChevronDown size={17} />
            </button>
          )}
        </div>
      </section>
      <ServiceStrip t={t} />
      <HomeLower t={t} setModal={setModal} />
    </main>
  );
}

function Hero({ t, query, setQuery, setActiveCategory, runSearch }) {
  const quick = [
    ["all", t.all, Boxes],
    ["ai", "AI", Bot],
    ["seo", "SEO", Search],
    ["pdf", "PDF", FileText],
    ["image", "图片", Image],
    ["dev", "开发", Code2],
    ["office", "办公", Archive]
  ];
  return (
    <section className="hero">
      <div className="heroDecor decorAi">AI</div>
      <div className="heroDecor decorCode">&lt;/&gt;</div>
      <div className="heroDecor decorChart">
        <BarChart3 size={42} />
      </div>
      <div className="heroInner">
        <h1>{t.heroTitle}</h1>
        <p>{t.heroText} ✨</p>
        <form className="heroSearch" onSubmit={(event) => { event.preventDefault(); runSearch(); }}>
          <Search size={28} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.heroSearch} />
          <button>{t.search}</button>
        </form>
        <div className="quickFilters">
          {quick.map(([id, label, Icon]) => (
            <button key={id} onClick={() => { setActiveCategory(id); scrollToSelector(".contentShell"); }}>
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats({ t }) {
  const items = [
    { value: "2000+", icon: Grid2X2, label: t.stats[0] },
    { value: "100+", icon: Grid2X2, label: t.stats[1] },
    { value: "10万+", icon: Clock3, label: t.stats[2] }
  ];
  return (
    <section className="statsBand">
      <div className="statsInner">
        {items.map((item) => (
          <div className="statItem" key={item.label}>
            <item.icon size={29} />
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
        <div className="statNote">
          <strong>{t.independent} →</strong>
          <span>{t.safe}</span>
        </div>
      </div>
    </section>
  );
}

function CategoryPanel({ t, cat, activeCategory, setActiveCategory }) {
  return (
    <div className="panel categoryPanel">
      <h3>{t.categoryTitle}</h3>
      <div className="categoryList">
        {categories.map((item) => {
          const Icon = categoryIcons[item.id];
          return (
            <button key={item.id} data-category-id={item.id} className={activeCategory === item.id ? "active" : ""} onClick={() => setActiveCategory(item.id)}>
              <span>
                <Icon size={18} />
                {cat[item.id]}
              </span>
              <small>{item.count}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ActionPanel({ icon: Icon, title, body, cta, onAction }) {
  return (
    <div className="panel actionPanel">
      <span className="softIcon">
        <Icon size={22} />
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      <button onClick={onAction}>{cta}</button>
    </div>
  );
}

function ToolGroup({ group, cat, t, isCondensed, setActiveCategory, openTool }) {
  const visibleTools = isCondensed ? group.tools.slice(0, 12) : group.tools;

  return (
    <section className="toolGroup">
      <header className="groupHeader">
        <div>
          <span className={`groupIcon ${group.id}`}>
            {React.createElement(categoryIcons[group.id], { size: 21 })}
          </span>
          <h2>{cat[group.id]}</h2>
          <p>{group.desc}</p>
        </div>
        <button onClick={() => { setActiveCategory(group.id); scrollToSelector(".contentShell"); }}>{t.viewAll}（{group.tools.length}）</button>
      </header>
      <div className="toolGrid">
        {visibleTools.map((tool) => (
          <ToolCard key={tool.name} tool={tool} t={t} onUse={() => openTool(tool)} />
        ))}
      </div>
    </section>
  );
}

function ToolCard({ tool, t, onUse }) {
  const Icon = tool.icon;
  return (
    <article className="toolCard">
      <span className="toolIcon">
        <Icon size={26} />
      </span>
      <div className="toolInfo">
        <h3>{tool.name}</h3>
        <p>{tool.desc}</p>
        <div className="tags">
          {tool.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <div className="cardMeta">
        <span>
          <Star size={14} fill="currentColor" />
          {tool.rating}
        </span>
        <span>{tool.users}</span>
        <button onClick={onUse}>{t.useNow}</button>
      </div>
    </article>
  );
}

function ServiceStrip({ t }) {
  const items = [
    { icon: Cloud, body: "所有工具在线使用，打开网页即可，免下载任何软件。" },
    { icon: ShieldCheck, body: "文件不会保存到云端，处理完成后自动删除，保护您的隐私安全。" },
    { icon: MonitorSmartphone, body: "支持电脑、手机、平板等多端访问，随时随地使用。" }
  ];
  return (
    <section className="serviceStrip">
      {items.map((item, index) => (
        <div key={t.serviceTitle[index]}>
          <span>
            <item.icon size={26} />
          </span>
          <strong>{t.serviceTitle[index]}</strong>
          <p>{item.body}</p>
        </div>
      ))}
    </section>
  );
}

function HomeLower({ t, setModal }) {
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <section className="homeLower">
      <div className="panel faqPanel">
        <PanelTitle title={t.faq} action={`${t.moreQuestions} →`} onAction={() => setOpenFaq(openFaq === "all" ? null : "all")} />
        {faqs.map((item) => (
          <div className="faqItem" key={item}>
            <button className="faqRow" onClick={() => setOpenFaq(openFaq === item ? null : item)}>
              {item}
              <Plus size={17} />
            </button>
            {(openFaq === item || openFaq === "all") && <p>{faqAnswers[item]}</p>}
          </div>
        ))}
      </div>
      <div className="panel articlePanel">
        <PanelTitle title={t.latest} action={`${t.moreArticles} →`} onAction={() => setModal({ type: "page", title: t.moreArticles, page: "articles" })} />
        {articles.map((article) => (
          <button className="articleRow" key={article.title} onClick={() => setModal({ type: "article", title: article.title, article })}>
            <span className={`articleThumb ${article.image}`}>
              {article.image.toUpperCase()}
            </span>
            <div>
              <h3>{article.title}</h3>
              <p>{article.meta}</p>
              <small>2024-05-08 · 8.5K 阅读</small>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}


export {
  HomePage,
  CategoryPanel,
  ActionPanel
};
