import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    // 登录页面（独立，不加载主布局）
    {
        path: 'login',
        loadComponent: () =>
            import('./views/login/login.component').then(
                (m) => m.LoginComponent
            )
    },
    // 错误页面（独立，不加载主布局）
    {
        path: '403',
        loadComponent: () =>
            import('./views/error-forbidden/error-forbidden.component').then(
                (m) => m.ErrorForbiddenComponent
            )
    },
    {
        path: '404',
        loadComponent: () =>
            import('./views/error-notfound/error-notfound.component').then(
                (m) => m.ErrorNotfoundComponent
            )
    },
    // 业务页面（带主布局，需要登录）
    {
        path: '',
        loadComponent: () =>
            import('./layouts/main-layout/main-layout.component').then(
                (m) => m.MainLayoutComponent
            ),
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./views/system-dashboard/system-dashboard.component').then(
                        (m) => m.SystemDashboardComponent
                    )
            },
            {
                path: 'accounts',
                loadComponent: () =>
                    import('./views/goofish-accounts/goofish-accounts.component').then(
                        (m) => m.GoofishAccountsComponent
                    )
            },
            {
                path: 'goods',
                loadComponent: () =>
                    import('./views/goofish-goods/goofish-goods.component').then(
                        (m) => m.GoofishGoodsComponent
                    )
            },
            {
                path: 'orders',
                loadComponent: () =>
                    import('./views/goofish-orders/goofish-orders.component').then(
                        (m) => m.GoofishOrdersComponent
                    )
            },
            {
                path: 'autosell',
                loadComponent: () =>
                    import('./views/bot-autosell/bot-autosell.component').then(
                        (m) => m.BotAutosellComponent
                    )
            },
            {
                path: 'workflow',
                loadComponent: () =>
                    import('./views/bot-workflow/bot-workflow.component').then(
                        (m) => m.BotWorkflowComponent
                    )
            },
            {
                path: 'autoreply',
                loadComponent: () =>
                    import('./views/bot-autoreply/bot-autoreply.component').then(
                        (m) => m.BotAutoreplyComponent
                    )
            },
            {
                path: 'conversations',
                loadComponent: () =>
                    import('./views/goofish-conversations/goofish-conversations.component').then(
                        (m) => m.GoofishConversationsComponent
                    )
            },
            {
                path: 'logs',
                loadComponent: () =>
                    import('./views/system-logs/system-logs.component').then(
                        (m) => m.SystemLogsComponent
                    )
            },
            {
                path: 'setting',
                loadComponent: () =>
                    import('./views/system-setting/system-setting.component').then(
                        (m) => m.SystemSettingComponent
                    )
            }
        ]
    },
    { path: '**', redirectTo: '404' }
];
