import React from "react";
import { BadgeCheck, BookOpen, Clock3, ShieldCheck, Star } from "../../shared/icons.js";
import { allTools, categoryIcons, faqAnswers } from "../../data/siteData.jsx";
import { useI18n } from "../../i18n/I18nProvider.jsx";
import { ActionPanel, CategoryPanel } from "../../pages/HomePage.jsx";
import { scrollToSelector } from "../../shared/utils.js";
import { GenericTool } from "./GenericTool.jsx";

function GenericToolPage({ tool, setRoute, setActiveCategory, notify, setModal, toggleSave, savedTools, openTool }) {
  const { categories: cat, messages: t } = useI18n();
  if (!tool) {
    return (
      <main className="toolLandingPage">
        <div className="emptyState panel">工具不存在，请返回首页重新选择。</div>
      </main>
    );
  }

  const Icon = tool.icon;
  const CategoryIcon = categoryIcons[tool.category] || categoryIcons.all;
  const relatedTools = allTools
    .filter((item) => item.category === tool.category && item.name !== tool.name)
    .slice(0, 6);
  const saved = savedTools.has(tool.name);
  const faqItems = [
    [`${tool.name} 可以免费使用吗？`, `可以。${tool.name} 当前页面可直接打开使用，基础能力不需要注册。`],
    [`${tool.name} 会上传我的文件或内容吗？`, "纯浏览器能力会优先在本机处理；需要外部 API 的能力会在结果区明确说明，不会假装已经联网完成。"],
    [`${tool.name} 适合手机使用吗？`, "适合。页面布局、输入区、结果区和常用操作都已按移动端响应式处理。"],
    ["我的文件会被保存到服务器吗？", faqAnswers["我的文件会被保存到服务器吗？"]]
  ];

  return (
    <main className="toolLandingPage">
      <div className="toolPageShell genericPageShell">
        <aside className="sidebar detailSidebar">
          <CategoryPanel
            t={t}
            cat={cat}
            activeCategory={tool.category}
            setActiveCategory={(id) => setActiveCategory ? setActiveCategory(id) : setRoute("home")}
          />
          <ActionPanel
            icon={BadgeCheck}
            title="收藏这个工具"
            body="常用工具独立访问，减少重复搜索。"
            cta={saved ? "已收藏" : t.collect}
            onAction={() => toggleSave(tool.name)}
          />
        </aside>

        <section className="toolMain">
          <div className="breadcrumb detailCrumb">
            <button onClick={() => setRoute("home")}>{t.breadcrumbHome}</button>
            <span>/</span>
            <button onClick={() => setActiveCategory ? setActiveCategory(tool.category) : setRoute("home")}>{cat[tool.category]}</button>
            <span>/</span>
            <strong>{tool.name}</strong>
          </div>

          <section className="genericHero panel">
            <span className={`genericHeroIcon ${tool.category}`}>
              <Icon size={42} />
            </span>
            <div>
              <div className="genericCategoryLine">
                <CategoryIcon size={17} />
                <span>{cat[tool.category]}</span>
              </div>
              <h1>{tool.name}</h1>
              <p>{tool.desc}。页面为独立落地页，支持收藏、复制、下载和移动端使用。</p>
              <div className="ratingLine">
                <span className="stars">★★★★★</span>
                <strong>{tool.rating}</strong>
                <span>{tool.users} 使用</span>
                <em>独立 URL</em>
                <em>在线运行</em>
              </div>
            </div>
            <button className={saved ? "saveBtn saved" : "saveBtn"} onClick={() => toggleSave(tool.name)}>
              <Star size={18} />
              {saved ? "已收藏" : "收藏"}
            </button>
          </section>

          <section className="genericRunner panel">
            <div className="panelTitle">
              <h2>在线使用 {tool.name}</h2>
              <button onClick={() => scrollToSelector(".genericSeo")}>查看说明</button>
            </div>
            <GenericTool tool={tool} notify={notify} toggleSave={toggleSave} saved={saved} />
          </section>

          <section className="genericSeo panel">
            <h2>{tool.name} 使用说明</h2>
            <div className="genericSeoGrid">
              <article>
                <BookOpen size={21} />
                <h3>适用场景</h3>
                <p>{tool.desc}，适合日常办公、内容处理、开发调试和快速验证。</p>
              </article>
              <article>
                <Clock3 size={21} />
                <h3>操作步骤</h3>
                <p>输入内容或选择文件，点击运行工具，处理完成后复制结果或下载到本地。</p>
              </article>
              <article>
                <ShieldCheck size={21} />
                <h3>隐私安全</h3>
                <p>优先使用浏览器本地能力处理数据。需要云端模型或服务的功能会明确提示。</p>
              </article>
            </div>
          </section>

          <section className="genericFaq panel">
            <h2>{tool.name} 常见问题</h2>
            <div className="seoFaqGrid">
              {faqItems.map(([question, answer]) => (
                <article key={question}>
                  <h3>{question}</h3>
                  <p>{answer}</p>
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="rightRail genericRightRail">
          <div className="panel sideInfo">
            <h3>工具标签</h3>
            <div className="tags blockTags">
              {tool.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <p>评分 {tool.rating}，累计 {tool.users} 使用。该页面可直接加入书签，也适合搜索引擎收录。</p>
          </div>
          <div className="panel sideInfo">
            <h3>同类工具</h3>
            <div className="relatedToolList">
              {relatedTools.map((item) => {
                const RelatedIcon = item.icon;
                return (
                  <button key={item.name} onClick={() => openTool(item)}>
                    <RelatedIcon size={17} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <ActionPanel icon={BadgeCheck} title="提交更好的工具" body="发现缺失工具或更强方案，可以提交到待审核列表。" cta={t.submit} onAction={() => setModal({ type: "submit", title: t.submit })} />
        </aside>
      </div>
    </main>
  );
}

export { GenericToolPage };
