# Impact Gaming / 银帕电竞

Impact Gaming 银帕电竞是一个三角洲行动娱乐护航俱乐部主页，主打“看起来像真的俱乐部，内容认真整活”。

## 页面内容

- 首屏战术 HUD：俱乐部标题、在线状态、护航频道与滚动价目条。
- 护航价目表：魔王护、大老板护、跑刀回收、哈夫币回收。
- 队员档案：大魔王、小小红、雨宫莲、小小怪四名可接席位，合并展示对应干员视觉。
- 首屏合成背景：战场图叠加多名干员，并在中间保留虚化文本区。

## 本地预览

直接用浏览器打开 `index.html` 即可，不需要 Node、Vite 或任何构建步骤。

## GitHub Pages 发布

1. 把本目录所有文件上传到仓库 `Marin764/Impact`。
2. 在 GitHub 仓库页面进入 `Settings` -> `Pages`。
3. Source 选择 `Deploy from a branch`。
4. Branch 选择 `main`，目录选择 `/root`。
5. 保存后等待 GitHub Pages 构建完成。

本项目按纯静态站实现，不需要 `node`、`npm` 或构建步骤。

## Vercel 部署

在 Vercel 中导入 `Marin764/Impact` 仓库即可：

- Framework Preset: `Other`
- Build Command: 留空
- Output Directory: 留空或 `.`
- Install Command: 留空

项目包含 `vercel.json`，用于开启 clean URLs，并给 `assets/` 静态资源设置长期缓存。

## 素材说明

本项目使用的三角洲行动相关图像来自公开游戏官网资源，仅用于娱乐展示与非商业页面示例。三角洲行动及相关角色、图片版权归其权利方所有；如需商用或长期公开运营，应替换为已授权素材。

四张队员头像来自本地文件夹原始图片，已复制到 `assets/avatars/` 并保留原图。
