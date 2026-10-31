export const SITE = {
  name: '机场优选 2026',
  short: '机场优选',
  en: 'Jichang Youxuan',
  url: 'https://jichangyouxuan.blog',
  year: 2026,
  lang: 'zh-CN',
  /** 顶部图标链接：telegram 为站长频道；github 留空则不显示（填入仓库地址后自动出现） */
  telegram: 'https://t.me/+pl2ujC4m36U1NWM1',
  github: 'https://github.com/wongkelvin1995-star/jichangyouxuan.blog/issues/1',
  ogImage: '/og-default.png',
  /** 站点内容最近一次实质更新日期（用于页面展示与 sitemap lastmod） */
  updated: '2026-10-31',
  dataCheckedOn: '2026-10-31',
  /** 历史参考套餐资料的整理日期（来源站点标注） */
  referenceDate: '2026-10-20',
  /** 视觉风格：sticker 贴纸云朵 / jelly 果冻橘猫 / crayon 蜡笔橘子 / planet 星空 / budo 武道金色能量（当前） */
  style: 'budo',
  /** 可选：填写后会显示在「关于」「隐私」页面，用于读者反馈与纠错。留空则不显示。 */
  contactEmail: 'wongkelvin1995@gmail.com',
};

/**
 * 各静态页面正文最近一次真实变化的日期（sitemap lastmod 用）。
 * 规则：只有该页的文字 / 数据 / 链接真的改了才更新；换版式、改样式、改脚本不算。
 */
export const PAGE_UPDATED: Record<string, string> = {
  '/': '2026-11-01',               // 首页标题与机场推荐用词调整（编辑精选顺序不变）
  '/rankings/': '2026-11-01',      // 标题与说明加入机场排名用词（榜单规则不变）
  '/airports/': '2026-11-01',      // 标题与说明改为机场导航 / 官网注册入口
  '/prices/': '2026-11-01',        // 标题与说明加入机场对比
  '/airports/firefly/': '2026-11-01', // 品牌名「飞为」改为 firefly
  '/coupons/': '2026-10-31',       // 优惠码总表上线；灵动云折扣范围说明
  couponsRegistered: '2026-10-30', // 34 家优惠码登记日（品牌页因此有新内容）
  '/budget-guide/': '2026-11-01',   // 估算器下方新增套餐建议与灵动云选档表
  '/selection-guide/': '2026-10-28',
  '/methodology/': '2026-10-31',   // 已核对 / 历史参考统计口径
  '/faq/': '2026-11-01',           // 新增：机场 VPN 是什么、有没有稳定机场推荐
  '/about/': '2026-10-31',         // 联系邮箱
  '/affiliate-disclosure/': '2026-10-28',
  '/privacy/': '2026-10-31',       // 联系邮箱
};

export const NAV = [
  { href: '/', label: '首页' },
  { href: '/airports/', label: '机场图鉴' },
  { href: '/prices/', label: '价格比较' },
  { href: '/rankings/', label: '排行榜' },
  { href: '/coupons/', label: '优惠码' },
  { href: '/budget-guide/', label: '按预算选' },
  { href: '/guides/', label: '文章' },
  { href: '/search/', label: '搜索' },
];

export const abs = (path: string) => new URL(path, SITE.url).href;

export const fmtDate = (d: Date | string) => {
  const x = typeof d === 'string' ? new Date(d) : d;
  return x.toISOString().slice(0, 10);
};
