import raw from './airports.json';

export interface Airport {
  id: number;
  slug: string;
  name: string;
  en: string;
  aliases: string[];
  /** 用户提供的原始推广入口，保持字符完整，不得改写 */
  url: string;
}

export const airports: Airport[] = raw as Airport[];

/** 首页固定编辑精选顺序：不随价格排序或筛选改变 */
export const TOP5_SLUGS = ['lingdongyun', 'muguang-jiasu', 'breezenet', 'feimaoyun', 'dalaoyun'];
export const top5: Airport[] = TOP5_SLUGS.map((s) => airports.find((a) => a.slug === s)!);
export const others: Airport[] = airports.filter((a) => !TOP5_SLUGS.includes(a.slug));

/** 34 家品牌均有独立详细页，内容由 profiles.json 中的各自资料生成 */
export const DETAIL_SLUGS = airports.map((a) => a.slug);

export const fullName = (a: Airport) => (a.en ? `${a.name} ${a.en}` : a.name);
export const hostOf = (a: Airport) => new URL(a.url).host;
export const rankOf = (a: Airport) => TOP5_SLUGS.indexOf(a.slug) + 1;
export const getAirport = (slug: string) => airports.find((a) => a.slug === slug)!;
export const lingdong = getAirport('lingdongyun');
