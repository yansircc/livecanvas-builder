import { Footer } from "@/components/footer";
import { MainNav } from "@/components/nav/main-nav";

export default function PrivacyPolicyPage() {
  const currentYear = 2025;

  return (
    <>
      <div className="mx-auto flex min-h-screen flex-col">
        <MainNav />
        <main className="container flex-1 py-12">
          <div className="mx-auto max-w-4xl space-y-8 px-4">
            <div>
              <h1 className="font-bold text-4xl text-zinc-900 tracking-tight dark:text-zinc-50">
                隐私政策
              </h1>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                最后更新时间: {currentYear} 年
              </p>
            </div>

            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <p className="lead">
                我们非常重视您的隐私。本隐私政策描述了我们收集、使用、披露和保护您在使用我们的服务时提供的信息的方式。
              </p>

              <h2>1. 信息收集</h2>
              <p>我们可能收集以下类型的信息：</p>
              <ul>
                <li>
                  <strong>个人信息：</strong>{" "}
                  包括您的姓名、电子邮件地址、个人资料照片等您在注册和使用我们的服务时提供的信息。
                </li>
                <li>
                  <strong>身份验证信息：</strong> 通过第三方服务（如 Google 或
                  Discord）进行身份验证时的相关信息。
                </li>
                <li>
                  <strong>使用数据：</strong>{" "}
                  关于您如何使用我们的服务的信息，包括您创建的内容、浏览历史、点击行为等。
                </li>
                <li>
                  <strong>设备信息：</strong>{" "}
                  包括您的IP地址、浏览器类型、操作系统、设备标识符等技术信息。
                </li>
                <li>
                  <strong>Cookies和类似技术：</strong>{" "}
                  我们使用cookies和类似技术来收集和存储信息。
                </li>
              </ul>

              <h2>2. 信息使用</h2>
              <p>我们可能会将收集的信息用于以下目的：</p>
              <ul>
                <li>提供、维护和改进我们的服务</li>
                <li>创建和管理您的账户</li>
                <li>处理您的请求和交易</li>
                <li>个性化您的用户体验</li>
                <li>分析使用模式以改进我们的服务</li>
                <li>与您沟通有关我们服务的更新和信息</li>
                <li>防止欺诈和增强安全性</li>
              </ul>

              <h2>3. 信息共享</h2>
              <p>
                我们不会出售您的个人信息。我们可能在以下情况下共享您的信息：
              </p>
              <ul>
                <li>
                  <strong>服务提供商：</strong>{" "}
                  与帮助我们提供服务的第三方服务提供商分享（如云存储、数据分析等）。
                </li>
                <li>
                  <strong>合规和法律要求：</strong> 如法律要求或为响应法律程序。
                </li>
                <li>
                  <strong>业务转让：</strong> 如果我们参与合并、收购或资产出售。
                </li>
                <li>
                  <strong>经您同意：</strong> 在您同意的情况下与其他方共享。
                </li>
              </ul>

              <h2>4. 数据安全</h2>
              <p>
                我们采取合理的安全措施来保护您的信息免受未经授权的访问、使用或披露。然而，没有任何在线传输或电子存储方法是100%安全的。
              </p>

              <h2>5. 数据保留</h2>
              <p>
                我们会在实现本政策中概述的目的所需的时间内保留您的信息，除非法律要求或允许更长的保留期。
              </p>

              <h2>6. 儿童隐私</h2>
              <p>
                我们的服务不面向13岁以下的儿童。我们不会故意收集13岁以下儿童的个人信息。
              </p>

              <h2>7. 您的权利</h2>
              <p>根据您所在地区的适用法律，您可能拥有以下权利：</p>
              <ul>
                <li>访问您的个人信息</li>
                <li>更正不准确的信息</li>
                <li>删除您的个人信息</li>
                <li>限制或反对处理</li>
                <li>数据可携带性</li>
                <li>撤回同意</li>
              </ul>

              <h2>8. 第三方链接</h2>
              <p>
                我们的服务可能包含指向第三方网站或服务的链接。我们对这些第三方的隐私政策或内容不负责任。
              </p>

              <h2>9. 隐私政策更新</h2>
              <p>
                我们可能会不时更新本隐私政策。更新后的政策将在我们的网站上发布，并在重大变更时通知您。
              </p>

              <h2>10. 联系我们</h2>
              <p>
                如果您对本隐私政策有任何问题或疑虑，请通过以下方式联系我们：
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
