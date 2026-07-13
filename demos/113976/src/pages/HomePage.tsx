// 首页
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Network as NetworkIcon, BookOpen, Pencil, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFamilyStore } from '@/store/familyStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { getDisplayName, getGenderLabel, getLifeSpan } from '@/utils/helpers';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selfPerson, loadFamily } = useFamilyStore();

  useEffect(() => {
    if (user) {
      loadFamily(user.id);
    }
  }, [user, loadFamily]);

  // 未创建本人节点：显示引导
  if (user && !selfPerson) {
    return (
      <>
        <PageHeader title="亲络家谱" />
        <div className="px-4 py-4">
          <div className="rounded-xl bg-gradient-to-br from-cinnabar-500 to-cinnabar-600 text-white p-5 shadow-paper-md mb-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={20} />
              <h2 className="text-lg font-serif font-bold">欢迎加入亲络家谱</h2>
            </div>
            <p className="text-sm text-cinnabar-100">
              您已成功登录，下一步请完善您的个人资料，开启家族树之旅。
            </p>
          </div>

          {/* 引导卡片 */}
          <div className="rounded-xl bg-white border border-xuan-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cinnabar-100 mb-4">
              <UserPlus size={28} className="text-cinnabar-500" />
            </div>
            <h3 className="text-base font-medium text-ink-800 mb-2">
              完善个人资料
            </h3>
            <p className="text-sm text-ink-500 mb-6">
              建立您的个人节点，作为家族树的根节点。后续可以添加父母、配偶、子女等亲属。
            </p>
            <Button
              fullWidth
              size="lg"
              onClick={() => navigate('/profile/new')}
            >
              开始完善
            </Button>
          </div>

          {/* 阶段提示 */}
          <div className="mt-4 rounded-lg bg-xuan-100 border border-xuan-300 p-3">
            <p className="text-xs text-ink-500">
              当前阶段：S2 本人节点 · 建立您的基本资料卡
            </p>
          </div>
        </div>
      </>
    );
  }

  // 已创建本人节点：显示资料卡 + 功能入口
  return (
    <>
      <PageHeader title="亲络家谱" />
      <div className="px-4 py-4">
        {/* 个人资料卡 */}
        {selfPerson && (
          <button
            onClick={() => navigate(`/person/${selfPerson.id}`)}
            className="block w-full text-left rounded-xl bg-gradient-to-br from-cinnabar-500 to-cinnabar-600 text-white p-5 shadow-paper-md mb-4"
          >
            <div className="flex items-center gap-3">
              <Avatar person={selfPerson} size="lg" className="ring-2 ring-white/40" />
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-serif font-bold truncate">
                  {getDisplayName(selfPerson)}
                </h2>
                <p className="text-sm text-cinnabar-100">
                  {getGenderLabel(selfPerson.gender)}
                  {getLifeSpan(selfPerson) ? ` · ${getLifeSpan(selfPerson)}` : ''}
                </p>
              </div>
              <ChevronRight size={20} className="text-cinnabar-100" />
            </div>
          </button>
        )}

        {/* 功能入口 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => navigate('/tree')}
            className="rounded-xl bg-white border border-xuan-200 p-4 flex flex-col items-center gap-2 hover:border-xuan-300 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-bamboo-100 flex items-center justify-center">
              <NetworkIcon size={22} className="text-bamboo-600" />
            </div>
            <span className="text-sm font-medium text-ink-700">家族树</span>
          </button>

          <button
            onClick={() => navigate('/add-relative')}
            className="rounded-xl bg-white border border-xuan-200 p-4 flex flex-col items-center gap-2 hover:border-xuan-300 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center">
              <UserPlus size={22} className="text-gold-600" />
            </div>
            <span className="text-sm font-medium text-ink-700">添加亲属</span>
          </button>
        </div>

        {/* 快捷操作 */}
        {selfPerson && (
          <button
            onClick={() => navigate(`/person/${selfPerson.id}/edit`)}
            className="w-full rounded-xl bg-white border border-xuan-200 p-3 flex items-center gap-3 hover:border-xuan-300 transition-colors mb-4"
          >
            <div className="w-8 h-8 rounded-full bg-xuan-100 flex items-center justify-center">
              <Pencil size={14} className="text-ink-500" />
            </div>
            <span className="text-sm text-ink-700">编辑我的资料</span>
            <ChevronRight size={16} className="ml-auto text-ink-400" />
          </button>
        )}

        {/* 阶段提示 */}
        <div className="rounded-xl bg-xuan-100 border border-xuan-300 p-4">
          <h3 className="text-sm font-medium text-ink-700 mb-2">
            当前阶段：S2 本人节点
          </h3>
          <p className="text-xs text-ink-500 leading-relaxed">
            您的个人资料已创建完成。下一阶段（S3）将实现添加亲属功能，支持添加父母、配偶、子女等关系。
          </p>
        </div>
      </div>
    </>
  );
}
