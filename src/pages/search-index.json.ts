import { getCollection } from 'astro:content';
import { airports, rankOf, fullName, hostOf } from '../data/airports';
import { faqs } from '../data/faq';
import { summaryLine, plansOf, profileOf } from '../data/plans';
import { coupons } from '../data/coupons';
import { rankings } from '../data/rankings';
import { categories } from '../data/categories';

const strip = (md: string) =>
  md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*`|_-]{1,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export async function GET() {
  const guides = (await getCollection('guides')).sort((a, b) => a.data.order - b.data.order);
  const docs: any[] = [];

  airports.forEach((a) => {
    const r = rankOf(a);
    docs.push({
      k: 'brand',
      o: a.id,
      t: fullName(a),
      u: `/airports/${a.slug}/`,
      a: [a.name, a.en, ...a.aliases].filter(Boolean).join('|'),
      s: `${r ? `编辑精选第 ${r} 位 · ` : ''}${summaryLine(a.slug)}${coupons[a.slug] ? ` · 优惠码 ${coupons[a.slug].code}` : ''}（历史参考，实测待更新）`,
      b: `${fullName(a)} ${a.aliases.join(' ')} 机场品牌 套餐 价格 优惠码 ${coupons[a.slug]?.code ?? ''} ${plansOf(a.slug).map((p) => p.planName).join(' ')} ${profileOf(a.slug).lineTypes.join(' ')} ${profileOf(a.slug).regions.join(' ')}`,
    });
  });

  guides.forEach((g) => {
    docs.push({ k: 'guide', o: g.data.order, t: g.data.title, u: `/guides/${g.id}/`, a: g.data.keyword, s: g.data.summary, b: strip(g.body ?? '') });
  });

  const pages = [
    { t: '机场优选 2026 首页', u: '/', s: '机场推荐、梯子优选与套餐价格比较指南。', b: '机场推荐 梯子推荐 机场优选 2026 编辑精选 TOP 5 灵动云 暮光加速 飞猫云 大佬云 微风网络 按预算选择机场 套餐比较' },
    { t: '34 家机场优选目录', u: '/airports/', s: '收录 34 家机场品牌，提供名称搜索、筛选与注册入口。', b: '机场目录 机场推荐 品牌资料库 注册入口 推广链接' },
    { t: '机场套餐价格比较', u: '/prices/', s: '同周期每 GB 成本计算器，只展示已核验价格。', b: '机场套餐价格 月付 年付 一次性流量包 每GB价格 便宜机场 性价比机场 计算器' },
    { t: '机场排行榜 2026（按价格规则）', u: '/rankings/', s: '百元内年付每 GB 成本、年付入门价、年付月均等六个规则榜单，非测速。', b: '机场排行榜 排名 便宜机场 性价比 ' + rankings.map((r) => r.title + ' ' + r.rows.slice(0, 5).map((x) => x.airport.name).join(' ')).join(' ') },
    { t: '机场优惠码汇总 2026', u: '/coupons/', s: '34 家机场优惠码一览，以结算页为准。', b: '优惠码 折扣码 优惠 ' + airports.map((a) => `${a.name}优惠码 ${coupons[a.slug]?.code ?? ''}`).join(' ') },
    { t: '更新记录', u: '/updates/', s: '资料与页面变更日志。', b: '更新记录 更新日期 变更 日志 实测 待更新' },
    ...categories.map((c) => ({ t: `${c.name}文章专区`, u: `/guides/category/${c.slug}/`, s: c.desc.slice(0, 60), b: `${c.name} ${c.flavor} 分类 专区 文章` })),
    { t: '根据预算选择机场', u: '/budget-guide/', s: '流量估算器与预算反推每 GB 成本。', b: '预算 流量估算 性价比机场 便宜机场 月付 年付 视频清晰度' },
    { t: '机场选购指南', u: '/selection-guide/', s: '六步判断一个机场套餐值不值得买。', b: '选购指南 机场推荐 线路 客户端 条款 退款 试用' },
    { t: '评选与套餐计算方法', u: '/methodology/', s: '编辑精选顺序、价格计算口径与数据核验规则。', b: '比较方法 编辑精选 测速排名 已核验 未核验 飞V firefly 不同品牌 大佬云 大哥云' },
    { t: '常见问题 FAQ', u: '/faq/', s: '预算、套餐、线路与使用疑问解答。', b: faqs.map((f) => f.q + ' ' + f.a).join(' ') },
    { t: '关于机场优选', u: '/about/', s: '本站定位、做什么和不做什么。', b: '关于 机场优选 独立 选购 博客' },
    { t: '推广关系说明', u: '/affiliate-disclosure/', s: '本站如何获得收入，以及推广关系对内容的影响。', b: '推广 佣金 sponsored nofollow 注册链接 非官方' },
    { t: '隐私政策', u: '/privacy/', s: '本站收集什么、不收集什么。', b: '隐私 cookie 日志 第三方链接' },
  ];
  pages.forEach((p, i) => docs.push({ k: 'page', o: i, a: '', ...p }));

  return new Response(JSON.stringify(docs), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
