/** 文章分类专区：slug 用于 /guides/category/<slug>/，name 必须与文章 frontmatter 的 category 一致 */
export interface GuideCategory { slug: string; name: string; flavor: string; desc: string }
export const categories: GuideCategory[] = [
  { slug: 'selection', name: '选购思路', flavor: '入门冒险', desc: '从「我为什么要买」出发：预算、流量、使用场景和周期如何决定你该看哪一类套餐。适合第一次选机场、或换过几家仍不满意的人。' },
  { slug: 'price', name: '价格成本', flavor: '战力分析', desc: '价格不是数字大小，而是「付款金额 ÷ 周期总流量」。这一组文章按阅读顺序排列：先读《便宜机场真的划算吗》学会算每 GB 成本和识别四种「便宜」的代价；再读《月付机场与年付机场怎么选》，用盈亏平衡月数判断年付值不值；最后读《灵动云套餐价格结构解读》，看一个具体品牌从月付到流量包的边际成本是怎么变化的。三篇用的都是价格页里可以复算的数字，没有测速结论。' },
  { slug: 'lines', name: '线路选择', flavor: '线路实战', desc: 'IEPL、IPLC、中转、直连这些词到底差在哪里？线路名称不等于速度，这里解释它们影响的是什么，以及下单前该问什么。' },
  { slug: 'scenarios', name: '使用场景', flavor: '实战场景', desc: '看流媒体、用 AI 服务、多人多设备：不同用途对机场的要求不同，这一组文章给出可以逐条核对的条件清单。' },
  { slug: 'clients', name: '客户端', flavor: '装备选择', desc: 'Clash、Shadowrocket、v2rayN 等客户端怎么选，订阅格式与设备数量怎么核对。从你手上的设备出发，而不是从软件名出发。' },
  { slug: 'pitfalls', name: '避坑指南', flavor: '经典招式', desc: '价格陷阱、设备限制、流量倍率、退款条款：这些是读者最常踩的坑。文章把每一条拆成下单前可以核对的动作。' },
  { slug: 'methodology', name: '方法与透明度', flavor: '更新记录', desc: '本站怎么比较 34 家机场、数据从哪里来、哪些结论不会写。读完可以判断本站的信息能信到什么程度。' },
];
export const categoryOf = (name: string) => categories.find((c) => c.name === name);
export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
