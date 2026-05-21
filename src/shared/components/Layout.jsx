import React, { useState } from "react";
import { Cloud, Globe2, Home, Menu, Moon, Search, X } from "../icons.js";
import { allTools, articles, faqAnswers, toolGroups } from "../../data/siteData.jsx";
import { useI18n } from "../../i18n/I18nProvider.jsx";
import { scrollToSelector, toCsv } from "../utils.js";

function Logo({ compact = false }) {
  const { messages: t } = useI18n();
  return (
    <button className="brand" onClick={() => window.dispatchEvent(new CustomEvent("goHome"))} aria-label="ToolBox Hub">
      <span className="brandMark">
        <span />
      </span>
      {!compact && (
        <span>
          <strong>{t.brand}</strong>
          <small>{t.brandSub}</small>
        </span>
      )}
    </button>
  );
}

function Header({ setRoute, route, mobileMenu, setMobileMenu, notify, setModal, setActiveCategory }) {
  const { categories: cat, locale, locales, messages: t, setLocale } = useI18n();
  const [headerQuery, setHeaderQuery] = useState("");
  React.useEffect(() => {
    const handler = () => setRoute("home");
    window.addEventListener("goHome", handler);
    return () => window.removeEventListener("goHome", handler);
  }, [setRoute]);

  const navActions = [
    () => setRoute("home"),
    () => { setRoute("home"); scrollToSelector(".contentShell"); },
    () => { setActiveCategory("ai"); scrollToSelector(".contentShell"); },
    () => { setModal({ type: "page", title: "排行榜", page: "ranking" }); },
    () => { setRoute("home"); scrollToSelector(".articlePanel"); },
    () => { setModal({ type: "page", title: "资源导航", page: "resources" }); },
    () => { setModal({ type: "page", title: "优惠活动", page: "deals" }); },
    () => { setModal({ type: "page", title: "关于我们", page: "about" }); }
  ];

  const runHeaderSearch = () => {
    const value = headerQuery.trim();
    if (!value) {
      notify("请输入搜索关键词");
      return;
    }
    setRoute("home");
    const matched = toolGroups.find((group) => group.tools.some((tool) => `${tool.name}${tool.desc}${tool.tags.join("")}`.toLowerCase().includes(value.toLowerCase())));
    setActiveCategory(matched?.id || "all");
    notify(matched ? `已定位到 ${cat[matched.id]} 相关工具` : "未找到精确匹配，已显示全部工具");
    scrollToSelector(".contentShell");
  };

  return (
    <header className="topbar">
      <div className="topbarInner">
        <Logo />
        <nav className={mobileMenu ? "nav open" : "nav"}>
          {t.nav.map((item, index) => (
            <button key={item} className={index === 0 && route === "home" ? "active" : ""} onClick={() => { navActions[index](); setMobileMenu(false); }}>
              {item}
            </button>
          ))}
        </nav>
        <div className="headerTools">
          <label className="miniSearch">
            <Search size={17} />
            <input value={headerQuery} onChange={(event) => setHeaderQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && runHeaderSearch()} placeholder={t.searchPlaceholder} />
          </label>
          <div className="langSwitch" aria-label="Language switch">
            {locales.map((item) => (
              <button key={item.id} className={locale === item.id ? "active" : ""} onClick={() => setLocale(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          <button className="submitButton" onClick={() => setModal({ type: "submit", title: t.submit })}>{t.submit}</button>
          <button className="mobileToggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Open menu">
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}


function PanelTitle({ title, action, onAction }) {
  return (
    <div className="panelTitle">
      <h2>{title}</h2>
      {action && <button onClick={onAction}>{action}</button>}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modalLayer" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modalPanel">
        <div className="modalHeader">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="关闭"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SubmitToolForm({ notify, onClose }) {
  const [form, setForm] = useState({ name: "", url: "", category: "AI工具", desc: "" });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !/^https?:\/\//.test(form.url)) {
      notify("请填写工具名称和以 http 开头的链接");
      return;
    }
    const submissions = JSON.parse(localStorage.getItem("toolSubmissions") || "[]");
    localStorage.setItem("toolSubmissions", JSON.stringify([{ ...form, id: Date.now() }, ...submissions]));
    notify("提交成功，已加入本地待审核列表");
    onClose();
  };
  return (
    <form className="modalForm" onSubmit={submit}>
      <label>工具名称<input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="例如：Markdown 编辑器" /></label>
      <label>工具链接<input value={form.url} onChange={(event) => update("url", event.target.value)} placeholder="https://example.com" /></label>
      <label>分类<select value={form.category} onChange={(event) => update("category", event.target.value)}>{["AI工具", "SEO工具", "图片工具", "PDF工具", "开发工具", "办公工具"].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>工具说明<textarea value={form.desc} onChange={(event) => update("desc", event.target.value)} placeholder="简要说明工具用途" /></label>
      <button className="primaryAction">提交审核</button>
    </form>
  );
}

function LoginForm({ notify, onClose }) {
  const [email, setEmail] = useState("");
  const submit = (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notify("请输入有效邮箱地址");
      return;
    }
    localStorage.setItem("toolboxUser", email);
    notify("登录成功，收藏和历史将保存在本机");
    onClose();
  };
  return (
    <form className="modalForm" onSubmit={submit}>
      <label>邮箱地址<input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
      <button className="primaryAction">登录 / 创建账号</button>
    </form>
  );
}

function ArticleView({ article }) {
  return (
    <div className="articleView">
      <span className={`articleThumb ${article.image}`}>{article.image.toUpperCase()}</span>
      <p>{article.meta}</p>
      <p>这篇教程会围绕工具选择、常见使用场景、效率建议和注意事项展开。当前版本已实现可点击阅读面板，后续可接入 Markdown 或 CMS 内容源。</p>
    </div>
  );
}

function SitePage({ page, setModal, notify, openTool }) {
  if (page === "ranking") {
    const ranked = [...allTools].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 12);
    return (
      <div className="sitePageList">
        {ranked.map((tool, index) => (
          <button key={tool.name} onClick={() => openTool(tool)}>
            <strong>{index + 1}. {tool.name}</strong>
            <span>{tool.desc}</span>
            <small>评分 {tool.rating} · {tool.users} 使用</small>
          </button>
        ))}
      </div>
    );
  }
  if (page === "articles") {
    return (
      <div className="sitePageList">
        {articles.concat([
          { title: "图片压缩和格式转换怎么选？", meta: "常见图片处理场景与最佳实践", image: "image" },
          { title: "JSON、CSV 与表格数据互转指南", meta: "开发者常用数据处理技巧", image: "data" }
        ]).map((article) => (
          <button key={article.title} onClick={() => setModal({ type: "article", title: article.title, article })}>
            <strong>{article.title}</strong>
            <span>{article.meta}</span>
            <small>2026-05-13 · 可阅读</small>
          </button>
        ))}
      </div>
    );
  }
  if (page === "resources") {
    return <ResourcePanel notify={notify} />;
  }
  if (page === "deals") {
    return <DealsPanel notify={notify} />;
  }
  if (page === "about") {
    return <AboutPanel setModal={setModal} />;
  }
  if (page === "api") {
    return <ApiPanel notify={notify} />;
  }
  if (page === "help") {
    return <HelpPanel />;
  }
  if (page === "feedback") {
    return <FeedbackForm notify={notify} />;
  }
  if (page === "contact") {
    return <ContactPanel notify={notify} />;
  }
  return <MessagePanel message="页面已打开。" />;
}

function ResourcePanel({ notify }) {
  const resources = [
    ["工具 API", "复制本地 API 示例", "curl https://api.toolbox.local/v1/tools"],
    ["开发者文档", "查看工具接入规范", "提交工具需提供名称、URL、分类、描述与隐私说明。"],
    ["友情链接", "复制申请模板", "站点名称：智用工具站；链接：https://toolbox.example.com"],
    ["数据导出", "下载工具目录 CSV", toCsv([["name", "category"], ...allTools.map((tool) => [tool.name, tool.category])])]
  ];
  return (
    <div className="sitePageList">
      {resources.map(([title, desc, payload]) => (
        <button key={title} onClick={() => { navigator.clipboard.writeText(payload); notify(`${title} 已复制到剪贴板`); }}>
          <strong>{title}</strong>
          <span>{desc}</span>
          <small>点击复制</small>
        </button>
      ))}
    </div>
  );
}

function DealsPanel({ notify }) {
  const [claimed, setClaimed] = useState(() => JSON.parse(localStorage.getItem("claimedDeals") || "[]"));
  const deals = ["收藏 5 个工具解锁快捷入口", "提交工具通过审核获得首页展示位", "订阅邮件获取每周效率工具包"];
  return (
    <div className="sitePageList">
      {deals.map((deal) => (
        <button key={deal} onClick={() => {
          const next = claimed.includes(deal) ? claimed : [...claimed, deal];
          setClaimed(next);
          localStorage.setItem("claimedDeals", JSON.stringify(next));
          notify(claimed.includes(deal) ? "你已领取过该活动" : "活动已领取");
        }}>
          <strong>{deal}</strong>
          <span>{claimed.includes(deal) ? "已领取" : "点击领取"}</span>
          <small>本地记录活动状态</small>
        </button>
      ))}
    </div>
  );
}

function AboutPanel({ setModal }) {
  return (
    <div className="articleView">
      <p>智用工具站是一个在线工具聚合与本地处理工具站。当前版本优先实现浏览器内可完成的工具能力：文本、数据、图片、PDF 文本提取、CSV/JSON 转换、表单和收藏历史。</p>
      <p>需要模型、联网爬取、复杂文件排版或加密能力的工具，会明确标注需要后端/API，不会假装已经完成。</p>
      <div className="modalActions">
        <button className="primaryAction" onClick={() => setModal({ type: "submit", title: "提交工具" })}>提交工具</button>
        <button onClick={() => setModal({ type: "page", title: "联系我们", page: "contact" })}>联系我们</button>
      </div>
    </div>
  );
}

function ApiPanel({ notify }) {
  const snippet = `fetch('/api/tools')\n  .then(res => res.json())\n  .then(console.log);`;
  return (
    <div className="genericTool">
      <p>当前是纯前端版本，没有真实后端 API。这里提供对接契约，点击可复制示例。</p>
      <pre>{snippet}</pre>
      <button className="primaryAction" onClick={() => { navigator.clipboard.writeText(snippet); notify("API 示例已复制"); }}>复制 API 示例</button>
    </div>
  );
}

function HelpPanel() {
  return (
    <div className="sitePageList">
      {Object.entries(faqAnswers).slice(0, 6).map(([question, answer]) => (
        <div className="helpItem" key={question}>
          <strong>{question}</strong>
          <p>{answer}</p>
        </div>
      ))}
    </div>
  );
}

function FeedbackForm({ notify }) {
  const [text, setText] = useState("");
  return (
    <form className="modalForm" onSubmit={(event) => {
      event.preventDefault();
      if (!text.trim()) return notify("请填写反馈内容");
      const feedback = JSON.parse(localStorage.getItem("feedback") || "[]");
      localStorage.setItem("feedback", JSON.stringify([{ id: Date.now(), text }, ...feedback]));
      setText("");
      notify("反馈已保存到本地");
    }}>
      <label>反馈内容<textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="描述问题或建议" /></label>
      <button className="primaryAction">提交反馈</button>
    </form>
  );
}

function ContactPanel({ notify }) {
  return (
    <div className="sitePageList">
      {["support@toolbox.local", "商务合作：bd@toolbox.local", "GitHub：toolbox-hub"].map((item) => (
        <button key={item} onClick={() => { navigator.clipboard.writeText(item); notify("联系方式已复制"); }}>
          <strong>{item}</strong>
          <span>点击复制</span>
        </button>
      ))}
    </div>
  );
}


function MessagePanel({ message }) {
  return <p className="messagePanel">{message}</p>;
}

function Footer({ setRoute, notify, setModal, setActiveCategory }) {
  const { categories: cat, messages: t } = useI18n();
  const [email, setEmail] = useState("");
  const subscribe = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notify("请输入有效邮箱地址");
      return;
    }
    notify("订阅成功，已记录邮箱");
    setEmail("");
  };

  return (
    <footer className="footer">
      <div className="footerInner">
        <div className="footerBrand">
          <Logo />
          <p>{t.footerSlogan}</p>
          <div className="socials">
            {[Globe2, Search, Cloud, Home].map((Icon, index) => <button key={index} onClick={() => index === 3 ? setRoute("home") : setModal({ type: "page", title: ["资源导航", "工具搜索", "云端说明"][index], page: index === 0 ? "resources" : index === 1 ? "ranking" : "api" })}><Icon size={16} /></button>)}
          </div>
        </div>
        <div>
          <h3>快速导航</h3>
          {t.nav.slice(0, 5).map((item, index) => <button key={item} onClick={() => {
            if (index === 0) setRoute("home");
            else if (index === 1) { setRoute("home"); scrollToSelector(".contentShell"); }
            else if (index === 2) { setActiveCategory("ai"); scrollToSelector(".contentShell"); }
            else if (index === 3) setModal({ type: "page", title: "排行榜", page: "ranking" });
            else setModal({ type: "page", title: "文章教程", page: "articles" });
          }}>{item}</button>)}
        </div>
        <div>
          <h3>热门分类</h3>
          {["ai", "seo", "image", "pdf", "dev"].map((id) => <button key={id} onClick={() => { setActiveCategory(id); scrollToSelector(".contentShell"); }}>{cat[id]}</button>)}
        </div>
        <div>
          <h3>资源与支持</h3>
          {["提交工具", "工具API", "帮助中心", "反馈建议", "联系我们"].map((item) => <button key={item} onClick={() => item === "提交工具" ? setModal({ type: "submit", title: t.submit }) : setModal({ type: "page", title: item, page: item === "工具API" ? "api" : item === "帮助中心" ? "help" : item === "反馈建议" ? "feedback" : "contact" })}>{item}</button>)}
        </div>
        <div className="subscribe">
          <h3>关注我们</h3>
          <p>订阅获取最新工具和干货</p>
          <label>
            <input value={email} onChange={(event) => setEmail(event.target.value)} onKeyDown={(event) => event.key === "Enter" && subscribe()} placeholder="输入您的邮箱地址" />
            <button onClick={subscribe}>订阅</button>
          </label>
          <small>尊重隐私，不会发送垃圾邮件。</small>
        </div>
      </div>
      <div className="footerBottom">
        <span>© 2024 智用工具站（ToolBox Hub）保留所有权利。</span>
        <span>使用条款　隐私政策　Sitemap　友情链接</span>
        <span>中　|　EN　|　日　<Moon size={14} /></span>
      </div>
    </footer>
  );
}


export {
  Header,
  Footer,
  Modal,
  SubmitToolForm,
  LoginForm,
  ArticleView,
  SitePage,
  MessagePanel,
  PanelTitle
};
