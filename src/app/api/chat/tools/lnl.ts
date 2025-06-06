import { createAnthropic } from "@ai-sdk/anthropic";
import { tool } from "ai";
import { generateObject } from "ai";
import { z } from "zod";

const LNL_GUIDE = `
# Loops & Logic 极简指南 (供 LLM 使用) (vFinal - 重构版)

Loops & Logic (L&L) 是一种标记语言，它通过动态标签扩展了 HTML，可以直接在模板中与 WordPress 数据进行交互。

## 核心概念

1.  **类 HTML 标签:** 使用大写的 L&L 标签 (\`<Loop>\`, \`<Field>\`) 与标准 HTML 标签 (\`<div>\`) 一起使用。
2.  **动态数据:** 标签用于获取和显示 WordPress 数据（文章、用户、字段等）。
3.  **上下文 (Context):** 标签作用于当前项目（在 \`<Loop>\` 内部）或当前页面/文章（在 \`<Loop>\` 外部）。通常可以指定上下文。
4.  **迭代:** \`<Loop>\` 标签是遍历数据集的核心。
5.  **条件判断:** \`<If>\` 标签允许基于数据或上下文进行逻辑判断。
6.  **变量:** \`<Set>\` 和 \`<Get>\` 允许存储和检索临时数据。
7.  **格式化:** \`<Format>\` 标签用于修改数据的输出。

## 核心语法规则

1.  **标签:** 使用大写的 L&L 标签 (\`<Loop>\`, \`<Field>\`) 和标准 HTML 标签 (\`<div>\`)。标签使用尖括号 \`<>\`。可以是自闭合的 (\`<Field />\`) 或包裹式的 (\`<Loop>...</Loop>\`)。
2.  **属性:** 为标签提供参数 (\`type="post"\`, \`name="title"\`)。如果值包含空格或特殊字符，通常需要引号 (\`"\`)。简单的字母数字值（加上 \`-\`, \`_\`）通常不需要引号。
3.  **\`< >\` vs \`{ }\` - 关键规则:**
    *   **\`< >\` 定义标签:** 用于 *所有* 标签结构，包括 HTML 和 L&L。
        *   示例: \`<Loop type=post>\`, \`<Field title />\`, \`<div class="my-class">\`
    *   **\`{ }\` 将动态值注入属性:** *仅* 用于属性的引号值 (\`"..."\`) 内部，以动态插入另一个 L&L 标签的输出。
        *   示例: \`<img src="{Field image_url}" />\`, \`<a href="{Field url}">\`, \`<Loop count="{Get max_items}">\`
        *   **原因:** \`<>\` 定义结构；\`{}\` 获取一个 *值* 以放入该结构的属性 *内部*。**使用 \`{}\` 时，务必给属性值加上引号。**
4.  **上下文:** 像 \`<Field>\` 这样的标签自动引用循环中的当前项或循环外的当前页面/文章。在 \`<Field>\` 上使用 \`id\`, \`name\`, 或 \`type\` 等属性来指定不同的上下文。
5.  **注释:** 使用标准的 HTML 注释 \`<!-- ... -->\`。注释内的 L&L 代码会被忽略。

## 核心 L&L 标签

*   **\`<Loop type="...">...</Loop>\`:** 遍历数据集（文章、用户、分类等）。\`type\` 属性是关键。
*   **\`<Field name="..." />\` (或 \`<Field field_name />\`):** 显示当前上下文中的特定数据片段。
*   **\`<If subject comparison value>...</If>\`:** 条件逻辑。与 \`<Else />\`, \`<Else if />\` 配合使用。
*   **\`<Set name="...">Value</Set>\` (或 \`<Set var_name>Value</Set>\`):** 定义一个变量。值可以包含其他 L&L 标签。
*   **\`<Get name="..." />\` (或 \`{Get var_name}\`):** 检索变量的值。在属性内部使用 \`{}\` 语法。支持作用域和特殊类型 (\`query\`, \`route\`, \`url\` 等)。
*   **\`<Format type="...">Content</Format>\`:** 格式化文本或数据（日期、数字、大小写等）。

## \`<Loop>\` 标签

根据 \`type\` 属性和查询参数遍历 WordPress 数据。

### 循环类型: \`post\` (文章、页面、自定义文章类型)

*   **目的:** 查询并循环遍历文章、页面或任何自定义文章类型。
*   **常用查询参数:** (许多与 \`WP_Query\` 参数一致)
    *   **筛选:** \`post_type\`, \`id\`, \`name\`, \`author\`, \`status\`, \`search\`, \`parent\`, \`include\`, \`exclude\`。
    *   **排序:** \`orderby\` (\`date\`, \`title\`, \`id\`, \`menu_order\`, \`rand\` 等), \`order\` (\`asc\`, \`desc\`)。
    *   **分类法:** \`category\`, \`tag\`, \`taxonomy\` + \`terms\`, \`taxonomy_compare\`。(多个查询使用 \`_2\`, \`_3\` 后缀)。
    *   **自定义字段:** \`custom_field\`, \`custom_field_value\`, \`custom_field_compare\`, \`custom_field_type\`。(使用 \`_2\`, \`_3\` 后缀)。
    *   **日期:** \`publish_date\`, \`publish_compare\`, \`publish_year/month/day\`。
    *   **分页:** \`count\` (限制数量), \`paged\` (每页项目数，启用分页), \`page\` (特定页码)。
*   **常用字段 (循环内部可用):** \`id\`, \`title\`, \`content\`, \`excerpt\` (使用 \`auto=true\`), \`url\`, \`name\`, \`status\`, \`publish_date\`, \`modified_date\`, \`author\` (用户循环), \`author_*\` (例如 \`author_name\`), \`image\` (附件循环), \`image_*\` (例如 \`image_url\`), \`parent\` (文章循环), \`children\` (文章循环), \`menu_order\`, \`post_class\`, \`edit_url\`, *任何自定义字段键名*。

### 循环类型: \`user\`

*   **目的:** 查询并循环遍历 WordPress 用户。
*   **常用查询参数:** \`id\`, \`include\`, \`exclude\`, \`name\`, \`role\`, \`not_role\`, \`orderby\`, \`order\`, \`count\`, \`paged\`。
*   **常用字段:** \`id\`, \`name\` (登录名), \`full_name\` (显示名称), \`email\`, \`url\`, \`avatar\` (\`<img>\` 标签), \`avatar_url\`, \`roles\` (角色列表), \`post_count\`, \`registration_date\`, \`edit_url\`, \`archive_url\`, *任何自定义用户元数据键名*。

### 循环类型: \`attachment\` (媒体库项目)

*   **目的:** 查询并循环遍历媒体库中的项目。
*   **常用查询参数:** \`id\`, \`include\`, \`exclude\`, \`name\`, \`author\`, \`parent\` (附件所属的文章 ID，使用 \`current\` 表示当前文章), \`status\`, \`orderby\`, \`order\`, \`count\`, \`paged\`, \`search\`。支持分类法/自定义字段查询。
*   **常用字段:** \`id\`, \`title\`, \`caption\`, \`description\`, \`alt\`, \`url\` (使用 \`size\` 属性: \`size=thumbnail\`), \`filename\`, \`extension\`, \`type\` (MIME 类型), \`size\` (格式化后的大小), \`sizes\` (属性), \`srcset\` (属性), \`parent\` (文章循环), \`author\` (用户循环), \`publish_date\`, \`edit_url\`, *任何自定义附件元数据键名*。

### 循环类型: \`taxonomy_term\` (分类、标签、自定义分类法术语)

*   **目的:** 查询并循环遍历分类法术语。
*   **常用查询参数:** \`taxonomy\` (**必需**), \`id\`, \`include\` (或 \`terms\`), \`exclude\`, \`name\`, \`orderby\`, \`order\`, \`parent\`, \`parents\` (仅顶级术语), \`children\` (需要上下文), \`hide_empty\`, \`post\` (与文章 ID 相关联), \`count\`。
*   **常用字段:** \`id\`, \`name\` (别名), \`title\` (显示名称), \`description\`, \`count\` (文章计数), \`url\` (归档链接), \`taxonomy\` (分类法循环), \`parent\` (术语循环), \`children\` (术语循环), \`posts\` (文章循环), *任何自定义术语元数据键名*。

## \`<Field>\` 标签

显示当前上下文中的单个数据片段。

*   **语法:** \`<Field name="..." />\` 或快捷方式 \`<Field field_name />\`。
*   **上下文:** 自动使用当前循环项或当前页面/文章。
*   **显式上下文:** 使用 \`id\`, \`name\`, \`type\` 等属性 (例如 \`<Field title id=123 />\`) 或 \`from\` (例如 \`<Field my_option from=options />\` 用于 ACF 选项页)。

## \`<If>\` 标签 (条件逻辑)

评估条件以显示/隐藏内容。与 \`<Else />\` 和 \`<Else if />\` 配合使用。

*   **语法:** \`<If subject comparison value>\` (comparison 和 value 通常是可选的)。
*   **常用 Subject:**
    *   \`field="field_name"\`: 检查当前上下文中的字段值。
    *   \`variable="var_name"\`: 检查 \`<Set>\` 定义的变量。
    *   \`loop\`: 检查一个循环（由 \`<If>\` 标签上的属性定义）是否会返回项目 (例如 \`<If loop type=post category=news>\`)。
    *   \`check="{Field dynamic_value}"\`: 评估属性内的动态内容。
    *   \`count\`: 当前循环索引（从 1 开始）。
    *   \`total\`: 当前循环中的总项目数。
    *   \`first\` / \`last\`: 当前循环项是否为第一个或最后一个。
    *   \`user\`: 检查当前用户状态 (例如 \`exists\`, \`role=editor\`)。
    *   \`archive\`: 检查当前页面是否为归档页 (使用 \`type\`, \`taxonomy\` 属性)。
    *   \`singular\`: 检查当前页面是否为单个文章/页面 (使用 \`type\` 属性)。
    *   \`query="param_name"\`: 检查 URL 查询参数。
    *   \`route="path/*"\`: 检查当前 URL 路径。
*   **常用 Comparison:**
    *   **存在性/相等性:** \`exists\` (无 value 时的默认值), \`not_exists\`, \`is\` (有 value 时的默认值), \`is_not\`。
    *   **文本:** \`includes\`, \`not_includes\`, \`starts_with\`, \`ends_with\`, \`matches_pattern\`。
    *   **数字:** \`more_than\`, \`less_than\`, \`more_than_or_equal\`, \`less_than_or_equal\`。
    *   **列表:** \`in\`, \`not_in\` (当 value 是列表时), \`any_is\`, \`all_is\` 等 (当 subject 是列表时)。
    *   **日期:** \`before\`, \`after\`, \`before_inclusive\`, \`after_inclusive\` (与 \`field\`, \`check\`, \`acf_date\` subject 配合使用)。与 "today", "YYYY-MM-DD" 等进行比较。

## 变量 (\`<Set>\` & \`<Get>\`)

在模板渲染期间存储和检索临时数据。

*   **\`<Set name="my_var">Value</Set>\` (或 \`<Set my_var>Value</Set>\`):** 定义名为 \`my_var\` 的变量。值可以包含文本、数字或其他 L&L 标签。
*   **\`<Get name="my_var" />\`:** 检索 \`my_var\` 的值以供显示。
*   **\`{Get my_var}\`:** 在属性 *内部* 检索值。
*   **作用域 & 类型:** 变量通常是局部的。\`<Get>\` 支持特殊类型如 \`query\`, \`route\`, \`url\`, \`site\`, \`setting\`, \`js\`, \`sass\` 来访问特定的数据源。

## \`<Format>\` 标签

修改内容的外观或结构。

*   **语法:** \`<Format type="...">要格式化的内容</Format>\`
*   **常用格式化属性 (\`type\` 或直接属性):**
    *   \`date="Y-m-d"\`: 格式化日期字符串/时间戳。使用 \`locale\`。
    *   \`number decimals=2 point="." thousands=","\`: 格式化数字。
    *   \`case="upper"\`: 更改大小写 (\`lower\`, \`upper\`, \`title\`, \`camel\`, \`kebab\`, \`snake\`, \`pascal\`)。
    *   \`length=50\`: 裁剪字符串长度。使用 \`offset\`。
    *   \`words=20\`: 裁剪为单词数。
    *   \`replace="this" with="that"\`: 简单文本替换。使用 \`_2\`, \`_3\` 进行更多替换。
    *   \`replace_pattern="/regex/" with="-"\`: 正则表达式替换。
    *   \`split=","\`: 将字符串拆分为列表。使用 \`trim\`。
    *   \`join=","\`: 将列表项连接成字符串。
    *   \`remove_html\`: 去除 HTML 标签。
    *   \`slug\`: 创建 URL 友好的别名。
    *   \`url_query\`: 为 URL 查询字符串编码。
    *   \`prefix="ID: "\`, \`suffix="..."\`: 在前后添加文本。
    *   \`list\`: 对列表中的每个项目应用格式 (例如 \`<Format list case=lower>\`)。

## 高级概念 / 其他功能

*   **ACF 集成:**
    *   使用 \`acf_\` 前缀访问字段: \`<Field acf_text=my_text_field />\`, \`<Field acf_image=my_image_field field=url />\`。
    *   循环遍历 Repeater/Gallery 字段: \`<Loop acf_repeater=my_repeater>\`, \`<Loop acf_gallery=my_gallery>\`。
    *   访问选项页: \`<Field acf_text=my_option from=options />\`。
*   **分页:**
    *   在 \`<Loop type=post>\` 上使用 \`paged=10\` (或 \`count=10\`) 启用。
    *   显示分页控件: \`<PaginateButtons />\`。
    *   显示分页信息: \`<PaginateFields><Field current_page /> / <Field total_pages /></PaginateFields>\`。
    *   支持 AJAX 和 \`scroll_top=true\`。(目前仅限 Post 循环)。
*   **逻辑变量:** 组合条件: \`<Set logic=my_cond all=true><If ...>true</If><If ...>true</If></Set>\`。然后使用 \`<If logic=my_cond>...\`。使用 \`any=true\` 实现 OR 逻辑。
*   **Switch/When:** 替代多个 If/Else If: \`<Switch field=status><When value=publish>...</When><When value=draft>...</When><When>...</When></Switch>\`。

## 常用标签快捷方式

*   \`<Field title />\` -> \`<Field name=title />\`
*   \`<Set my_var>...</Set>\` -> \`<Set name=my_var>...</Set>\`
*   \`<Get url=site />\` -> \`<Url site />\` (旧语法, 推荐 \`<Get>\`)
*   \`<Taxonomy category>\` -> \`<Loop type=taxonomy_term taxonomy=category>\` (依赖上下文)
*   \`<User field=name />\` -> \`<Loop type=user id=current><Field name /></Loop>\` (获取当前用户字段)

## 基础示例

\`\`\`html
<tangible>
  <!-- 列出最新的 3 篇博客文章 -->
  <Loop type=post post_type=post count=3 orderby=date order=desc>
    <article>
      <!-- 链接到文章的文章标题 -->
      <h2><a href="{Field url}"><Field title /></a></h2>

      <!-- 仅向登录用户显示摘要 -->
      <If user exists>
        <!-- 检查是否存在手动摘要 -->
        <If field=excerpt exists>
          <p><Field excerpt words=30 /></p> <!-- 显示手动摘要，限制字数 -->
        <Else />
          <!-- 如果没有手动摘要，则从内容创建 -->
          <p><Format words=30><Field content remove_html /></Format></p>
        </If>
      </If>

      <!-- 文章元信息 -->
      <small>
        作者: <Field author_full_name />
        发布于 <Format date="Y年n月j日"><Field publish_date /></Format>
      </small>
    </article>
  </Loop>
</tangible>
\`\`\`

## ACF 示例

\`\`\`html
<tangible>
  <!-- 在单个文章/页面上显示 ACF 字段的内容 -->
  <article class="portfolio-item">
    <h1><Field title /></h1> <!-- 标准文章标题 -->
    <!-- ACF Gallery 字段 (假设字段名为 'project_gallery') -->
    <div class="project-gallery">
      <h3>项目相册</h3>
      <!-- 使用 <If loop> 检查相册是否有图片 -->
      <If loop acf_gallery=project_gallery>
        <div class="gallery-grid">
          <!-- 循环遍历相册中的每张图片 -->
          <Loop acf_gallery=project_gallery>
            <figure>
              <!-- 显示每张相册图片的缩略图 -->
              <img src="{Field url size=thumbnail}" alt="{Field alt}" />
              <!-- 如果此特定图片存在说明文字，则显示 -->
              <If field=caption exists>
                <figcaption><Field caption /></figcaption>
              </If>
            </figure>
          </Loop>
        </div>
      <Else />
        <p>没有其他相册图片。</p>
      </If>
    </div>
  </article>
</tangible>
\`\`\`

## 归档模板示例

\`\`\`html
<tangible>
  <!-- 产品归档模板示例 (使用 CPT 'product' 和 ACF 字段) -->
  <!-- 这段代码通常放在归档模板文件或模板块中 -->

  <h1>我们的产品</h1>

  <!-- 循环遍历所有已发布的 'product' 文章类型 -->
  <Loop type=post post_type=product status=publish orderby=title order=asc paged=12>
    <article class="product-archive-item">
      <!-- 特色图片 -->
      <If field=image exists>
          <img src="{Field image_url size=thumbnail}" alt="{Field image_alt}">
      </If>

      <!-- 产品名称 (ACF 文本字段 'product_name') 链接到产品页面 -->
      <h2><a href="{Field url}"><Field acf_text=product_name /></a></h2>

      <!-- 产品价格 (ACF 数字字段 'product_price') -->
      <div class="product-price">
        ￥<Format number decimals=2><Field acf_number=product_price /></Format>
      </div>

      <!-- 简短描述 (ACF 文本区域字段 'product_description') -->
      <div class="product-description">
        <Format words=25><Field acf_textarea=product_description remove_html /></Format>...
      </div>

      <!-- 查看产品详情链接 -->
      <a href="{Field url}" class="button">查看产品</a>

    </article>
  </Loop>

  <!-- 如果使用了 'paged' 属性，添加分页控件 -->
  <PaginateButtons />
</tangible>
\`\`\`


## 分类页面示例

\`\`\`html
<tangible>
  <!-- 分类页面模板 - 显示当前分类及其产品 -->
  <div class="category-page">
    <!-- 获取当前分类信息 -->
    <Loop type=taxonomy_term taxonomy=product-category terms=current>
      <header class="category-header">
        <h1><Field title /></h1>
        
        <!-- 如果有分类描述则显示 -->
        <If field=description exists>
          <div class="category-description"><Field description /></div>
        </If>
      </header>
    </Loop>
    
    <!-- 产品列表 - 获取当前分类下的产品 -->
    <div class="products-grid">
      <Loop type=post post_type=product status=publish 
            taxonomy=product-category term_id="{Field taxonomy_term_id}"
            orderby=date order=desc paged=12>
        <article class="product-card">
          <!-- 产品图片 -->
          <If field=image exists>
            <a href="{Field url}" class="product-image">
              <img src="{Field image_url size=medium}" alt="{Field title}">
            </a>
          <Else />
            <!-- 无图片时显示占位图 -->
            <a href="{Field url}" class="product-image">
              <img src="/path/to/placeholder.jpg" alt="{Field title}">
            </a>
          </If>

          <div class="product-details">
            <!-- 产品标题 -->
            <h2>
              <a href="{Field url}"><Field title /></a>
            </h2>

            <!-- 产品价格 -->
            <div class="product-price">
              $<Format number decimals=2><Field acf_number=product_price /></Format>
            </div>

            <!-- 产品分类标签 -->
            <div class="product-categories">
              <Loop type=taxonomy_term taxonomy=product_category post=current>
                <span class="category-tag"><Field title /></span>
              </Loop>
            </div>

            <!-- 查看详情按钮 -->
            <a href="{Field url}" class="view-button">了解更多</a>
          </div>
        </article>
      </Loop>
    </div>

    <!-- 分页控件 -->
    <div class="pagination">
      <PaginateButtons />
    </div>
  </div>
</tangible>

## 产品分类页示例

\`\`\`html
<tangible>
  <!-- 产品分类页面示例：获取当前分类并显示相关产品 -->
  <div class="category-container">
    <!-- 获取当前分类信息 (使用 terms="current" 获取当前查看的分类) -->
    <Loop type="taxonomy_term" taxonomy="product-category" terms="current">
      <h1 class="category-title"><Field title /></h1>
      
      <!-- 如果存在分类描述则显示 -->
      <If field="description" exists>
        <div class="category-description"><Field description /></div>
      </If>
      
      <!-- 保存当前分类ID到变量，以便在产品循环中使用 -->
      <Set current_term_id><Field id /></Set>
    </Loop>
    
    <!-- 使用变量过滤产品列表，仅显示属于当前分类的产品 -->
    <div class="products-grid">
      <!-- 使用 {Get current_term_id} 从变量中获取分类ID -->
      <Loop type="post" post_type="product" status="publish" 
            taxonomy="product-category" terms="{Get current_term_id}" 
            orderby="date" order="desc" paged="9">
        <article class="product-card">
          <!-- 产品图片 -->
          <If field="image" exists>
            <a href="{Field url}" class="product-image">
              <img src="{Field image_url size=medium}" alt="{Field title}">
            </a>
          </If>
          
          <!-- 产品信息 -->
          <div class="product-info">
            <h2><a href="{Field url}"><Field title /></a></h2>
            
            <!-- 产品价格 -->
            <div class="product-price">
              ¥<Format number decimals="2"><Field acf_number=product_price /></Format>
            </div>
            
            <!-- 显示产品所有分类标签 -->
            <div class="product-categories">
              <Loop type="taxonomy_term" taxonomy="product-category" post="current">
                <span class="category-tag"><Field title /></span>
              </Loop>
            </div>
          </div>
        </article>
      </Loop>
    </div>
    
    <!-- 分页控件 -->
    <PaginateButtons />
  </div>
</tangible>
\`\`\`
`;

const simplifiedFieldSchema = z.object({
	type: z.string(),
	name: z.string(),
});

interface LNLGeneratorResult {
	code: string;
}

export const generateLNLCodeTool = tool({
	description:
		"生成基于acf字段的动态LNL(tangible loop & logic, 它是一个增强的html，带有用于wordpress数据的动态标签)代码。",
	parameters: z.object({
		fields: z.array(simplifiedFieldSchema),
		apiKey: z.string().describe("The api key for AI"),
		instruction: z.string().describe("The detailed instruction for AI"),
	}),
	execute: async ({
		fields,
		apiKey,
		instruction,
	}): Promise<LNLGeneratorResult> => {
		const anthropic = createAnthropic({
			apiKey: apiKey,
			baseURL: "https://aihubmix.com/v1",
		});

		console.log(`instruction: ${instruction}`);

		const { object } = await generateObject({
			model: anthropic("claude-3-7-sonnet-20250219"),
			schema: z.object({
				code: z
					.string()
					.describe(
						"LNL(tangible loop & logic) HTML template code snippets. The template should only include one piece of LNL HTML code snippet to demonstrate the dynamic template, without any CSS or JavaScript.",
					),
			}),
			system: `
			你是 LNL(tangible loop & logic) 代码的专家。
			你的任务是根据用户提供的 ACF 字段，协助用户设计一个极简的演示 LNL 模板。
			请参考以下 LNL 指南：
			${LNL_GUIDE}
      请注意：
      不管你得到的 ACF 字段中是否包含标题、内容、特色图片和链接字段，它们都是默认存在的，你可以随时调用。
      如果你要创建Archive页面，在涉及到图像显示时，请遵循以下优先级：
      1. 使用 WordPress 默认的特色图像字段，例如：<img src="{Field image_url size=medium}">
      2. 如果可用，使用 ACF 中定义的图像字段，例如：<img src="{Field acf_image=project_image field=url size=medium}">
      如果创建的是单页，尽可能展示所有字段，但如果创建的是Archive 页面，在设计前要询问用户希望展示哪些字段。
			`,
			prompt: `
			下面是用户提供的 ACF 字段：
			${JSON.stringify(fields, null, 2)}
      请注意，标题<Field title />、内容<Field content />、特色图片<img src="{Field image_url}">和链接<a href="{Field url}">{Field title}</a>字段是默认存在，你可以随时调用。
      输出的代码请务必包裹在<tangible>标签中。
      请严格遵照以下命令来输出代码：
      ${instruction}
			`,
			maxRetries: 3,
		});
		return object;
	},
});
