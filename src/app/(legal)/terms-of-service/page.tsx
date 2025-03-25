import { Footer } from "@/components/footer";
import { MainNav } from "@/components/nav/main-nav";

export default function TermsOfServicePage() {
  const currentYear = 2025;

  return (
    <>
      <div className="mx-auto flex min-h-screen flex-col">
        <MainNav />
        <main className="container flex-1 py-12">
          <div className="mx-auto max-w-4xl space-y-8 px-4">
            <div>
              <h1 className="font-bold text-4xl text-zinc-900 tracking-tight dark:text-zinc-50">
                服务条款
              </h1>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                最后更新时间: {currentYear} 年
              </p>
            </div>

            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <h2>1. 条款接受</h2>
              <p>
                通过访问和使用我们的服务，您确认您已阅读、理解并同意受这些条款的约束。如果您不同意这些条款的任何部分，您可能不会访问或使用我们的服务。
              </p>

              <h2>2. 服务说明</h2>
              <p>
                我们提供一个平台，允许用户创建、编辑和管理数据可视化和图表。我们保留随时修改、暂停或终止服务的权利，恕不另行通知。
              </p>

              <h2>3. 用户账户</h2>
              <p>
                使用我们的某些功能可能需要您创建账户。您有责任保护您的账户信息，并对您账户下发生的所有活动负责。我们保留拒绝服务、终止账户或删除内容的权利。
              </p>

              <h2>4. 用户内容</h2>
              <p>
                您保留您创建并上传到我们服务的内容的版权。然而，通过上传内容，您授予我们非排他性、全球性、免版税的许可，以使用、复制、修改、公开展示和分发您的内容。
              </p>

              <h2>5. 隐私政策</h2>
              <p>
                您使用我们服务的同时，也同意我们的隐私政策，该政策描述了我们如何收集、使用和共享您的信息。
              </p>

              <h2>6. 知识产权</h2>
              <p>
                我们的服务及其原始内容、功能和设计受国际著作权、商标、专利、商业秘密和其他知识产权法律的保护。
              </p>

              <h2>7. 服务的使用限制</h2>
              <p>您同意不会以任何方式使用服务：</p>
              <ul>
                <li>违反任何法律或法规</li>
                <li>侵犯他人的权利</li>
                <li>干扰服务的正常运行</li>
                <li>尝试未经授权访问我们的系统</li>
                <li>进行任何可能损害我们或其他用户的活动</li>
              </ul>

              <h2>8. 免责声明</h2>
              <p>
                我们的服务按"原样"和"可用"的基础提供，不提供任何明示或暗示的保证。我们不保证服务将不间断、及时、安全或无错误。
              </p>

              <h2>9. 责任限制</h2>
              <p>
                在法律允许的最大范围内，我们对任何直接、间接、附带、特殊、后果性或惩罚性损害不承担责任。
              </p>

              <h2>10. 条款变更</h2>
              <p>
                我们可能随时修改这些条款。修改后的条款将在发布后立即生效。继续使用我们的服务将构成对修改条款的接受。
              </p>

              <h2>11. 联系我们</h2>
              <p>
                如果您对这些条款有任何问题，请通过以下方式联系我们：
                <a
                  href="mailto:yansir@xunpanziyou.com"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  yansir@xunpanziyou.com
                </a>
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
