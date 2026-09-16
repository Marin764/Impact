"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Backpack,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  CloudSun,
  Download,
  Edit3,
  Footprints,
  Info,
  LocateFixed,
  MapPin,
  Menu,
  Navigation,
  Plane,
  Plus,
  Route,
  Save,
  ShoppingBag,
  Sparkles,
  TrainFront,
  Upload,
  WalletCards,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

type Spot = {
  id: string;
  day: number;
  order: number;
  name: string;
  korean: string;
  type: "景点" | "美食" | "购物" | "酒店";
  time: string;
  stay: string;
  x: number;
  y: number;
  photoPosition: "left" | "center" | "right";
  intro: string;
  tip: string;
  address: string;
};

type RouteInfo = {
  id: string;
  day: number;
  from: string;
  to: string;
  method: string;
  duration: string;
  note: string;
};

const sampleSpots: Spot[] = [
  { id: "gyeongbokgung", day: 1, order: 1, name: "景福宫", korean: "경복궁", type: "景点", time: "09:00", stay: "2小时", x: 42, y: 27, photoPosition: "left", intro: "首尔五大宫之首。穿韩服可免费入场，上午光线也最适合拍照。", tip: "周二闭馆；守门将换岗仪式通常在光化门前举行，建议提前 15 分钟到。", address: "161 Sajik-ro, Jongno-gu" },
  { id: "bukchon", day: 1, order: 2, name: "北村韩屋村", korean: "북촌한옥마을", type: "景点", time: "12:10", stay: "1.5小时", x: 56, y: 22, photoPosition: "center", intro: "传统韩屋与首尔城市天际线交叠的散步区域，适合慢慢走、随走随拍。", tip: "这里仍有居民生活，请压低音量；坡路较多，穿防滑好走的鞋。", address: "37 Gyedong-gil, Jongno-gu" },
  { id: "gwangjang", day: 1, order: 3, name: "广藏市场", korean: "광장시장", type: "美食", time: "16:00", stay: "2小时", x: 63, y: 43, photoPosition: "center", intro: "从绿豆煎饼到紫菜包饭，一站式体验首尔传统市场小吃。", tip: "热门摊位可能排队；准备少量韩元现金更方便，先看清价格再点单。", address: "88 Changgyeonggung-ro, Jongno-gu" },
  { id: "seongsu", day: 2, order: 1, name: "圣水洞", korean: "성수동", type: "购物", time: "10:30", stay: "3小时", x: 78, y: 64, photoPosition: "center", intro: "旧工厂改造的咖啡店、买手店和品牌快闪集中地。", tip: "快闪店营业信息变化快；建议出发当天再确认品牌社交账号。", address: "Seongsu-dong 2-ga, Seongdong-gu" },
  { id: "seoulforest", day: 2, order: 2, name: "首尔林", korean: "서울숲", type: "景点", time: "14:20", stay: "1.5小时", x: 72, y: 70, photoPosition: "left", intro: "适合放慢节奏的城市森林，和圣水洞可连成轻松步行路线。", tip: "面积较大，不必走完全程；雨天可缩短停留，把时间留给室内咖啡店。", address: "273 Ttukseom-ro, Seongdong-gu" },
  { id: "namsan", day: 2, order: 3, name: "N首尔塔", korean: "N서울타워", type: "景点", time: "18:10", stay: "2小时", x: 47, y: 61, photoPosition: "right", intro: "在南山看首尔从日落到亮灯，是第一次来首尔很值得保留的夜景时段。", tip: "缆车排队时间波动大；风大时体感温度低，随身带一件薄外套。", address: "105 Namsangongwon-gil, Yongsan-gu" },
  { id: "hongdae", day: 3, order: 1, name: "弘大延南洞", korean: "홍대 · 연남동", type: "购物", time: "11:00", stay: "3小时", x: 22, y: 51, photoPosition: "center", intro: "独立小店、咖啡馆与街头文化密集，适合没有硬性目标的一段自由探索。", tip: "周末人流明显增加；购物后记得确认是否支持退税和退换货。", address: "Hongik-ro, Mapo-gu" },
  { id: "yeouido", day: 3, order: 2, name: "汝矣岛汉江公园", korean: "여의도한강공원", type: "景点", time: "15:30", stay: "1.5小时", x: 31, y: 72, photoPosition: "left", intro: "在汉江边休息、看日落，天气好时可以体验便利店煮拉面。", tip: "夜间江边风大；垃圾按分类回收，不要把食物留在草地。", address: "330 Yeouidong-ro, Yeongdeungpo-gu" },
  { id: "myeongdong", day: 3, order: 3, name: "明洞", korean: "명동", type: "购物", time: "18:30", stay: "2小时", x: 45, y: 49, photoPosition: "right", intro: "集中采购美妆、伴手礼的高效率收尾站，回酒店也相对方便。", tip: "不同门店赠品与退税门槛不同；护肤品注意托运行李液体规则。", address: "Myeongdong-gil, Jung-gu" },
];

const sampleRoutes: RouteInfo[] = [
  { id: "d1-1", day: 1, from: "景福宫", to: "北村韩屋村", method: "步行", duration: "约 22 分钟", note: "一路缓上坡，经过国立现代美术馆附近；雨天建议搭短程出租车。" },
  { id: "d1-2", day: 1, from: "北村韩屋村", to: "广藏市场", method: "地铁 + 步行", duration: "约 28 分钟", note: "安国站上车，钟路5街站下车。韩国地铁内避免大声通话。" },
  { id: "d2-1", day: 2, from: "圣水洞", to: "首尔林", method: "步行", duration: "约 18 分钟", note: "沿首尔林咖啡街步行即可，部分路段自行车较多，注意避让。" },
  { id: "d2-2", day: 2, from: "首尔林", to: "N首尔塔", method: "地铁 + 巴士", duration: "约 55 分钟", note: "高峰期换乘拥挤，建议预留 15 分钟；下山末班车时间要提前确认。" },
  { id: "d3-1", day: 3, from: "弘大延南洞", to: "汝矣岛汉江公园", method: "地铁", duration: "约 32 分钟", note: "使用 T-money 进出站；不要误乘机场铁路直达列车。" },
  { id: "d3-2", day: 3, from: "汝矣岛汉江公园", to: "明洞", method: "地铁", duration: "约 35 分钟", note: "晚餐时段人多，进站前先确认行驶方向，避免跨站台折返。" },
];

// Keep the original generic seed available as a reference while the workspace plan is active.
void sampleSpots;
void sampleRoutes;

// Parsed from 首尔4天3晚_Citywalk夜景加强版.html in this workspace.
const actualSpots: Spot[] = [
  { id: "airport", day: 1, order: 1, name: "仁川机场", korean: "인천국제공항", type: "景点", time: "13:00", stay: "3–4小时", x: 13, y: 81, photoPosition: "left", intro: "完成入境、取行李并搭乘 6001 机场巴士前往东大门。", tip: "保存酒店韩文地址；按机场现场指引确认 6001 站台。", address: "Incheon International Airport" },
  { id: "hotel", day: 1, order: 2, name: "东大门酒店", korean: "트래블로지 동대문 서울", type: "酒店", time: "16:30", stay: "办理入住", x: 63, y: 45, photoPosition: "center", intro: "三晚固定住宿点，也是每天路线的安全返回坐标。", tip: "入住时确认早餐、行李寄存和退房时间。", address: "Travelodge Dongdaemun Seoul" },
  { id: "gwangjang-real", day: 1, order: 3, name: "广藏市场", korean: "광장시장", type: "美食", time: "17:30", stay: "45分钟", x: 57, y: 40, photoPosition: "center", intro: "用市场小吃认识首尔，再按体力决定正式晚饭。", tip: "晚到时市场和一只鸡只选一个，不叠两顿正餐。", address: "88 Changgyeonggung-ro, Jongno-gu" },
  { id: "cheonggye", day: 1, order: 4, name: "清溪川东段", korean: "청계천 오간수교", type: "景点", time: "19:00", stay: "45分钟", x: 66, y: 48, photoPosition: "right", intro: "沿河道与街灯慢走，作为第一晚夜景开场。", tip: "桥上俯拍或河边低机位选一种即可，注意湿滑台阶。", address: "Ogansugyo, Jongno-gu" },
  { id: "ddp", day: 1, order: 5, name: "东大门设计广场", korean: "동대문디자인플라자", type: "景点", time: "20:00", stay: "1小时", x: 72, y: 49, photoPosition: "right", intro: "用建筑曲面、人流和车灯完成 NIGHT 01。", tip: "不预设一定有灯光秀；人物用 1 倍，建筑可尝试 0.5 倍。", address: "281 Eulji-ro, Jung-gu" },
  { id: "forest-real", day: 2, order: 1, name: "首尔林", korean: "서울숲", type: "景点", time: "09:30", stay: "1.5小时", x: 73, y: 68, photoPosition: "left", intro: "从林地、镜池和城市绿意开始第二天。", tip: "控制在 60–90 分钟，给圣水和汉江保留体力。", address: "273 Ttukseom-ro, Seongdong-gu" },
  { id: "seongsu-real", day: 2, order: 2, name: "圣水演武场路", korean: "성수동 연무장길", type: "购物", time: "12:00", stay: "3小时", x: 80, y: 64, photoPosition: "center", intro: "午餐后沿红砖街区、品牌店和咖啡馆散步。", tip: "快闪信息变化快；同一天最多排一家热门店。", address: "Yeonmujang-gil, Seongdong-gu" },
  { id: "tukseom", day: 2, order: 3, name: "纛岛汉江公园", korean: "뚝섬한강공원", type: "景点", time: "16:45", stay: "2小时", x: 86, y: 78, photoPosition: "right", intro: "从日落前等到桥梁与对岸灯光完全亮起。", tip: "提前日落 45–60 分钟到；江边风大，带薄外套。", address: "139 Gangbyeonbuk-ro, Gwangjin-gu" },
  { id: "palace-real", day: 3, order: 1, name: "景福宫", korean: "경복궁", type: "景点", time: "09:00", stay: "2小时", x: 42, y: 27, photoPosition: "left", intro: "老城线起点，重点看勤政殿、庆会楼和宫墙。", tip: "周二闭馆；是否穿韩服以天气和舒适为先。", address: "161 Sajik-ro, Jongno-gu" },
  { id: "samcheong", day: 3, order: 2, name: "三清洞", korean: "삼청동", type: "美食", time: "11:30", stay: "1小时", x: 50, y: 24, photoPosition: "center", intro: "用面片汤或简单韩餐补充体力。", tip: "排队过长就换附近餐厅，不错过北村时段。", address: "Samcheong-dong, Jongno-gu" },
  { id: "bukchon-real", day: 3, order: 3, name: "北村韩屋村", korean: "북촌한옥마을", type: "景点", time: "13:00", stay: "1小时", x: 56, y: 22, photoPosition: "center", intro: "选一段能看到韩屋屋脊与城市层次的坡道。", tip: "居民区内压低音量，不堵门口，遵守现场限时。", address: "37 Gyedong-gil, Jongno-gu" },
  { id: "ikseon", day: 3, order: 4, name: "益善洞", korean: "익선동 한옥거리", type: "美食", time: "14:30", stay: "1小时", x: 59, y: 35, photoPosition: "center", intro: "在韩屋巷里喝一杯，为傍晚骆山留出体力。", tip: "疲劳时删掉坐店，早点休息。", address: "Ikseon-dong, Jongno-gu" },
  { id: "naksan", day: 3, order: 5, name: "骆山公园城墙", korean: "낙산공원", type: "景点", time: "17:00", stay: "2小时", x: 70, y: 31, photoPosition: "right", intro: "全程最高优先级夜景，从暮色看到城市完全亮起。", tip: "短途打车省上坡；不上墙、不跨护栏，蓝调时先拍合照。", address: "41 Naksan-gil, Jongno-gu" },
  { id: "myeongdong-real", day: 4, order: 1, name: "明洞圣堂", korean: "명동대성당", type: "景点", time: "09:00", stay: "1小时", x: 48, y: 49, photoPosition: "left", intro: "返程日上午的轻量散步，用红砖建筑为行程收尾。", tip: "以外部参观为主，避开礼拜并保持安静。", address: "74 Myeongdong-gil, Jung-gu" },
  { id: "hotel-return", day: 4, order: 2, name: "酒店取行李", korean: "호텔 체크아웃", type: "酒店", time: "11:15", stay: "45分钟", x: 63, y: 45, photoPosition: "center", intro: "取包、退房并在中午前正式出发。", tip: "不要把最后一小时留给购物。", address: "Travelodge Dongdaemun Seoul" },
  { id: "port", day: 4, order: 3, name: "仁川国际码头", korean: "인천항 국제여객터미널", type: "景点", time: "15:00", stay: "登船", x: 11, y: 86, photoPosition: "right", intro: "地铁 1 号线至东仁川站，再打车前往国际客运码头。", tip: "不是机场也不是旧码头；至少提前 2–3 小时到港，并确认最晚报到时间。", address: "인천광역시 연수구 국제항만대로326번길 57" },
];

const actualRoutes: RouteInfo[] = [
  { id: "r11", day: 1, from: "仁川机场", to: "东大门酒店", method: "6001 机场巴士", duration: "90–120 分钟", note: "按机场现场指引确认站台，在 Baiton Hotel 站下车后步行去酒店。" },
  { id: "r12", day: 1, from: "东大门酒店", to: "广藏市场", method: "步行", duration: "15 分钟", note: "第一晚按体力调整；晚到就删减市场或正式晚饭。" },
  { id: "r13", day: 1, from: "广藏市场", to: "清溪川东段", method: "步行", duration: "12 分钟", note: "饭后沿河段慢走，夜间注意台阶与湿滑路面。" },
  { id: "r14", day: 1, from: "清溪川东段", to: "DDP", method: "步行", duration: "15 分钟", note: "不以限定活动为前提，建筑与街灯本身就是拍摄重点。" },
  { id: "r21", day: 2, from: "首尔林", to: "圣水演武场路", method: "步行", duration: "18 分钟", note: "沿街慢走即可，按体力选择咖啡店。" },
  { id: "r22", day: 2, from: "圣水演武场路", to: "纛岛汉江公园", method: "步行 + 地铁", duration: "30 分钟", note: "16:00 左右开始移动，确保在日落前到江边。" },
  { id: "r31", day: 3, from: "景福宫", to: "三清洞", method: "步行", duration: "15 分钟", note: "排队过长立即换店。" },
  { id: "r32", day: 3, from: "三清洞", to: "北村韩屋村", method: "步行", duration: "12 分钟", note: "坡路较多，穿防滑好走的鞋。" },
  { id: "r33", day: 3, from: "北村韩屋村", to: "益善洞", method: "步行", duration: "22 分钟", note: "只安排一间咖啡店，把体力留给骆山。" },
  { id: "r34", day: 3, from: "益善洞", to: "骆山公园城墙", method: "短途出租车", duration: "15 分钟", note: "省掉一段上坡；骆山不与南山塔叠加。" },
  { id: "r41", day: 4, from: "明洞圣堂", to: "酒店取行李", method: "地铁", duration: "25 分钟", note: "10:30 前结束明洞短走，确保有时间退房。" },
  { id: "r42", day: 4, from: "酒店取行李", to: "仁川国际码头", method: "地铁 1 号线 + 出租车", duration: "2–3 小时", note: "确认仁川方向支线，到东仁川站后打车；以报到截止时间倒推。" },
];

const essentials = [
  "护照（确认有效期）与电子备份",
  "韩国电子入境卡 / 所需签证材料",
  "可境外使用的银行卡与少量韩元",
  "T-money 交通卡",
  "韩标转换插头（两圆脚 Type C/F）",
  "境外流量卡 / eSIM",
  "常用药与处方证明",
  "舒适防滑的步行鞋",
];

const travelNotes = [
  { title: "入境前", body: "确认护照、签证/免签政策、返程机票和住宿信息。政策会变化，出发前以官方最新信息为准。", icon: Plane },
  { title: "支付与退税", body: "大多数门店可刷卡，但传统市场备少量现金更稳妥。购物时主动询问即时退税或机场退税流程。", icon: WalletCards },
  { title: "交通", body: "公交下车也要刷交通卡。地铁换乘距离可能较长，赶时间时预留 10–15 分钟。", icon: TrainFront },
  { title: "沟通与礼仪", body: "准备韩文地址截图；餐馆可用翻译软件。乘扶梯、排队和居民区拍摄时留意现场规则。", icon: Info },
];

const dayMeta = [
  { day: 1, label: "东大门夜色", date: "10.03 · DAY 1", color: "#e65b3b" },
  { day: 2, label: "圣水与汉江", date: "10.04 · DAY 2", color: "#287f70" },
  { day: 3, label: "宫殿与骆山", date: "10.05 · DAY 3", color: "#596db7" },
  { day: 4, label: "明洞与返程", date: "10.06 · DAY 4", color: "#8b684f" },
];

function linePath(spots: Spot[]) {
  if (!spots.length) return "";
  return spots.map((spot, index) => `${index ? "L" : "M"} ${spot.x} ${spot.y}`).join(" ");
}

export default function Home() {
  const [spots, setSpots] = useState<Spot[]>(() => {
    if (typeof window === "undefined") return actualSpots;
    const saved = window.localStorage.getItem("seoul-trip-spots");
    if (!saved) return actualSpots;
    try { return JSON.parse(saved) as Spot[]; } catch { return actualSpots; }
  });
  const [activeDay, setActiveDay] = useState(1);
  const [selected, setSelected] = useState<Spot | RouteInfo | null>(null);
  const [panel, setPanel] = useState<"packing" | "notes" | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checked, setChecked] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = window.localStorage.getItem("seoul-trip-checked");
    if (!saved) return [];
    try { return JSON.parse(saved) as string[]; } catch { return []; }
  });
  const [toast, setToast] = useState("");

  useEffect(() => {
    const modelContext = (document as Document & { modelContext?: { registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    const register = async () => {
      await modelContext.registerTool({
        name: "add_trip_spot",
        title: "添加旅行地点",
        description: "把一个地点添加到指定天的旅行地图，并保存到当前设备。",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1 },
            day: { type: "integer", minimum: 1, maximum: 4 },
            time: { type: "string" },
            tip: { type: "string" },
          },
          required: ["name", "day"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input: unknown) {
          const value = input as { name?: unknown; day?: unknown; time?: unknown; tip?: unknown };
          if (typeof value.name !== "string" || !value.name.trim() || !Number.isInteger(value.day) || Number(value.day) < 1 || Number(value.day) > 4) throw new Error("name 必须为非空文本，day 必须是 1–4 的整数");
          const day = Number(value.day);
          setSpots((current) => {
            const created: Spot = { id: `agent-${Date.now()}`, day, order: current.filter((spot) => spot.day === day).length + 1, name: value.name!.toString().trim(), korean: "待补充", type: "景点", time: typeof value.time === "string" ? value.time : "待定", stay: "1小时", x: 50, y: 45, photoPosition: "center", intro: "通过行程工具添加的地点。", tip: typeof value.tip === "string" ? value.tip : "出发前确认开放时间与交通。", address: "待补充地址" };
            const next = [...current, created];
            window.localStorage.setItem("seoul-trip-spots", JSON.stringify(next));
            return next;
          });
          setActiveDay(day);
          return { success: true, name: value.name.trim(), day };
        },
      }, { signal: lifecycle.signal });
    };
    void register().catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  const daySpots = useMemo(() => spots.filter((spot) => spot.day === activeDay).sort((a, b) => a.order - b.order), [spots, activeDay]);
  const dayRoutes = actualRoutes.filter((route) => route.day === activeDay);
  const currentDay = dayMeta[activeDay - 1];
  const selectedSpot = selected && "type" in selected ? selected : null;
  const selectedRoute = selected && "method" in selected ? selected : null;

  function persist(next: Spot[]) {
    setSpots(next);
    window.localStorage.setItem("seoul-trip-spots", JSON.stringify(next));
    showToast("行程已保存在这台设备");
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function togglePacked(item: string, value: boolean) {
    const next = value ? [...checked, item] : checked.filter((entry) => entry !== item);
    setChecked(next);
    window.localStorage.setItem("seoul-trip-checked", JSON.stringify(next));
  }

  function saveSpot(form: FormData) {
    const existing = selectedSpot;
    const nextSpot: Spot = {
      id: existing?.id ?? `custom-${Date.now()}`,
      day: Number(form.get("day")),
      order: existing?.order ?? spots.filter((s) => s.day === Number(form.get("day"))).length + 1,
      name: String(form.get("name")),
      korean: String(form.get("korean") || "自定义地点"),
      type: String(form.get("type")) as Spot["type"],
      time: String(form.get("time") || "待定"),
      stay: String(form.get("stay") || "1小时"),
      x: existing?.x ?? 50 + Math.round(Math.random() * 18 - 9),
      y: existing?.y ?? 45 + Math.round(Math.random() * 18 - 9),
      photoPosition: existing?.photoPosition ?? "center",
      intro: String(form.get("intro") || "还没有备注。"),
      tip: String(form.get("tip") || "出发前确认开放时间与交通。"),
      address: String(form.get("address") || "待补充地址"),
    };
    const next = existing ? spots.map((spot) => spot.id === existing.id ? nextSpot : spot) : [...spots, nextSpot];
    persist(next);
    setEditOpen(false);
    setSelected(nextSpot);
    setActiveDay(nextSpot.day);
  }

  function exportPlan() {
    const blob = new Blob([JSON.stringify({ title: "首尔 Citywalk 夜景计划", spots }, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "seoul-trip-plan.json";
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("行程文件已导出");
  }

  return (
    <main className="trip-shell">
      <header className="topbar">
        <div className="brand-mark">S</div>
        <div className="trip-title">
          <span>2026.10.03–10.06 · 首尔</span>
          <strong>Citywalk 夜景计划</strong>
        </div>
        <div className="weather-chip"><CloudSun size={18} /><span><b>23°</b> 多云</span></div>
        <button className="icon-btn mobile-only" aria-label="打开菜单" onClick={() => setMenuOpen(true)}><Menu /></button>
      </header>

      <aside className="desktop-sidebar">
        <div className="side-intro"><span>MY TRIP</span><h1>首尔夜行<br />四日记</h1><p>两位同学 · 东大门出发 · Citywalk × 城市夜景 × 美食</p></div>
        <nav className="side-days" aria-label="选择行程日期">
          {dayMeta.map((meta) => (
            <button key={meta.day} className={activeDay === meta.day ? "active" : ""} onClick={() => setActiveDay(meta.day)}>
              <span style={{ background: meta.color }}>{meta.day}</span><div><b>{meta.date}</b><small>{meta.label}</small></div><ChevronRight />
            </button>
          ))}
        </nav>
        <div className="side-tools">
          <button onClick={() => setPanel("notes")}><CircleAlert />出国提醒</button>
          <button onClick={() => setPanel("packing")}><ShoppingBag />购买清单 <span>{checked.length}/{essentials.length}</span></button>
          <button onClick={() => { setSelected(null); setEditOpen(true); }}><Plus />添加地点</button>
          <button onClick={exportPlan}><Download />导出行程</button>
        </div>
        <div className="safety-card"><Sparkles /><div><b>今日小提醒</b><p>保存酒店韩文地址截图，迷路时比口头描述更有效。</p></div></div>
      </aside>

      <section className="map-workspace" aria-label={`第 ${activeDay} 天地图`}>
        <div className="map-toolbar">
          <div className="day-heading"><span>{currentDay.date}</span><h2>{currentDay.label}</h2><p>{daySpots.length} 个地点 · 预计步行 8.6 km</p></div>
          <div className="map-actions">
            <button onClick={() => showToast("已回到当天路线范围")}><LocateFixed />定位路线</button>
            <button className="primary" onClick={() => { setSelected(null); setEditOpen(true); }}><Plus />添加地点</button>
          </div>
        </div>

        <div className="map-canvas">
          <div className="map-grid" />
          <svg className="map-art" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path className="river" d="M -4 69 C 12 61, 22 76, 39 69 S 69 55, 104 63" />
            <path className="road major" d="M 3 42 C 22 38 32 43 48 39 S 76 28 101 33" />
            <path className="road" d="M 17 4 C 25 28 38 49 43 101" />
            <path className="road" d="M 68 -4 C 62 22 66 48 83 101" />
            <path className="road" d="M 4 86 C 30 77 63 83 101 76" />
            <path className="route-shadow" d={linePath(daySpots)} />
            <path className="route-line" d={linePath(daySpots)} style={{ stroke: currentDay.color }} />
          </svg>
          <span className="map-label label-jongno">钟路区<br /><small>JONGNO-GU</small></span>
          <span className="map-label label-jung">中区<br /><small>JUNG-GU</small></span>
          <span className="map-label label-mapogu">麻浦区<br /><small>MAPO-GU</small></span>
          <span className="map-label label-river">汉江 · HAN RIVER</span>

          {dayRoutes.map((route, index) => {
            const a = daySpots[index]; const b = daySpots[index + 1];
            if (!a || !b) return null;
            return <button key={route.id} className="route-hit" aria-label={`${route.from}到${route.to}的路线`} style={{ left: `${(a.x + b.x) / 2}%`, top: `${(a.y + b.y) / 2}%` }} onClick={() => setSelected(route)}><Route size={16} /><span>{route.duration.replace("约 ", "")}</span></button>;
          })}

          {daySpots.map((spot) => (
            <button key={spot.id} className="map-marker" style={{ left: `${spot.x}%`, top: `${spot.y}%`, "--marker": currentDay.color } as React.CSSProperties} onClick={() => setSelected(spot)} aria-label={`查看${spot.name}`}>
              <span>{spot.order}</span><label>{spot.name}<small>{spot.time}</small></label>
            </button>
          ))}

          <div className="map-legend"><span><i style={{ background: currentDay.color }} />当日路线</span><span><i className="spot-dot" />打卡点</span></div>
        </div>

        <div className="mobile-day-strip" aria-label="切换日期">
          {dayMeta.map((meta) => <button key={meta.day} className={activeDay === meta.day ? "active" : ""} onClick={() => setActiveDay(meta.day)}><b>D{meta.day}</b><span>{meta.label}</span></button>)}
        </div>

        <div className="timeline-peek">
          <div className="peek-title"><span>今天的路线</span><button onClick={() => setPanel("notes")}>出国提醒 <ChevronRight /></button></div>
          <div className="spot-cards">
            {daySpots.map((spot) => <button key={spot.id} onClick={() => setSelected(spot)}><span className="time">{spot.time}</span><div className={`mini-photo photo-${spot.photoPosition}`}><span>{spot.order}</span></div><div><b>{spot.name}</b><small>{spot.korean} · {spot.stay}</small></div></button>)}
          </div>
        </div>
      </section>

      <nav className="mobile-bottom-nav" aria-label="快捷功能">
        <button className="active"><Navigation /><span>行程</span></button>
        <button onClick={() => setPanel("notes")}><CircleAlert /><span>提醒</span></button>
        <button className="add" onClick={() => { setSelected(null); setEditOpen(true); }}><Plus /></button>
        <button onClick={() => setPanel("packing")}><Backpack /><span>清单</span></button>
        <button onClick={() => setMenuOpen(true)}><Menu /><span>更多</span></button>
      </nav>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="bottom" className="detail-sheet">
          {selectedSpot && <>
            <div className={`detail-photo photo-${selectedSpot.photoPosition}`}><span className="type-pill"><MapPin />{selectedSpot.type}</span></div>
            <SheetHeader className="detail-head"><div><SheetTitle>{selectedSpot.name}</SheetTitle><SheetDescription>{selectedSpot.korean} · {selectedSpot.address}</SheetDescription></div><span className="order-badge">D{selectedSpot.day} · {selectedSpot.order}</span></SheetHeader>
            <div className="detail-content">
              <div className="detail-facts"><span><Clock3 />{selectedSpot.time} 到达</span><span><Footprints />停留 {selectedSpot.stay}</span></div>
              <p>{selectedSpot.intro}</p>
              <div className="tip-box"><CircleAlert /><div><b>旅行提示</b><p>{selectedSpot.tip}</p></div></div>
              <button className="edit-button" onClick={() => setEditOpen(true)}><Edit3 />编辑这个地点</button>
            </div>
          </>}
          {selectedRoute && <>
            <SheetHeader className="route-detail-head"><span className="route-icon"><TrainFront /></span><div><SheetTitle>{selectedRoute.from} → {selectedRoute.to}</SheetTitle><SheetDescription>点击地图上的路线随时查看交通建议</SheetDescription></div></SheetHeader>
            <div className="detail-content">
              <div className="route-summary"><div><span>推荐方式</span><b>{selectedRoute.method}</b></div><div><span>预计用时</span><b>{selectedRoute.duration}</b></div></div>
              <div className="tip-box"><CircleAlert /><div><b>途中注意</b><p>{selectedRoute.note}</p></div></div>
            </div>
          </>}
        </SheetContent>
      </Sheet>

      <Sheet open={!!panel} onOpenChange={(open) => !open && setPanel(null)}>
        <SheetContent side="right" className="info-sheet">
          <SheetHeader><SheetTitle>{panel === "packing" ? "出发购买清单" : "第一次出国提醒"}</SheetTitle><SheetDescription>{panel === "packing" ? `已准备 ${checked.length} / ${essentials.length} 项，勾选会自动保存在本机。` : "出发前、在机场和韩国当地最容易忘记的几件事。"}</SheetDescription></SheetHeader>
          {panel === "packing" ? <div className="packing-list">{essentials.map((item) => <label key={item}><Checkbox checked={checked.includes(item)} onCheckedChange={(value) => togglePacked(item, value === true)} /><span className={checked.includes(item) ? "done" : ""}>{item}</span></label>)}</div> : <div className="notes-list">{travelNotes.map(({ title, body, icon: Icon }) => <article key={title}><Icon /><div><b>{title}</b><p>{body}</p></div></article>)}</div>}
          <div className="info-foot"><Info /><p>涉及入境与签证的内容会随政策变化。临行前请再次查看官方信息。</p></div>
        </SheetContent>
      </Sheet>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="menu-sheet"><SheetHeader><SheetTitle>行程工具</SheetTitle><SheetDescription>管理与备份你的旅行计划</SheetDescription></SheetHeader><div className="menu-list"><button onClick={() => { setMenuOpen(false); setPanel("notes"); }}><CircleAlert />出国提醒<ChevronRight /></button><button onClick={() => { setMenuOpen(false); setPanel("packing"); }}><ShoppingBag />购买清单<ChevronRight /></button><button onClick={() => { setMenuOpen(false); setSelected(null); setEditOpen(true); }}><Plus />添加地点<ChevronRight /></button><button onClick={exportPlan}><Download />导出 JSON 行程<ChevronRight /></button><label className="fake-upload"><Upload />导入行程文件<input type="file" accept=".json" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const data = JSON.parse(String(reader.result)); if (Array.isArray(data.spots)) { persist(data.spots); setMenuOpen(false); } else throw new Error(); } catch { showToast("暂时只支持本站导出的 JSON 文件"); } }; reader.readAsText(file); }} /><ChevronRight /></label></div><div className="import-note"><Upload /><div><b>稍后发我 PDF 或 HTML</b><p>我会按你的正式计划核对地点、路线和顺序，再帮你精准标到地图里。</p></div></div></SheetContent>
      </Sheet>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="edit-dialog"><DialogHeader><DialogTitle>{selectedSpot ? "编辑地点" : "添加一个地点"}</DialogTitle><DialogDescription>先记录必要信息；地图位置之后也可以继续微调。</DialogDescription></DialogHeader><form action={saveSpot}>
          <div className="form-grid"><label><span>地点名称</span><input name="name" required defaultValue={selectedSpot?.name} placeholder="例如：乐天世界" /></label><label><span>韩文 / 当地名称</span><input name="korean" defaultValue={selectedSpot?.korean} placeholder="可稍后补充" /></label><label><span>第几天</span><select name="day" defaultValue={selectedSpot?.day ?? activeDay}><option value="1">DAY 1</option><option value="2">DAY 2</option><option value="3">DAY 3</option><option value="4">DAY 4</option></select></label><label><span>类型</span><select name="type" defaultValue={selectedSpot?.type ?? "景点"}><option>景点</option><option>美食</option><option>购物</option><option>酒店</option></select></label><label><span>到达时间</span><input name="time" type="time" defaultValue={selectedSpot?.time === "待定" ? "" : selectedSpot?.time} /></label><label><span>建议停留</span><input name="stay" defaultValue={selectedSpot?.stay} placeholder="例如：2小时" /></label><label className="full"><span>地址</span><input name="address" defaultValue={selectedSpot?.address} placeholder="街道或韩文地址" /></label><label className="full"><span>地点介绍</span><textarea name="intro" defaultValue={selectedSpot?.intro} placeholder="为什么值得去？" /></label><label className="full"><span>旅行提示</span><textarea name="tip" defaultValue={selectedSpot?.tip} placeholder="开放时间、预约、避坑等" /></label></div><button className="save-button" type="submit"><Save />保存到行程</button>
        </form></DialogContent>
      </Dialog>

      {toast && <div className="toast-message"><Check />{toast}</div>}
    </main>
  );
}
