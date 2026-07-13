// 家族树页面（S1 阶段占位，S4 阶段完整实现）
import { useNavigate } from 'react-router-dom';
import { Network as NetworkIcon, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';

export function TreePage() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="家族树" />
      <EmptyState
        icon={<NetworkIcon size={48} strokeWidth={1.5} />}
        title="家族树还是空的"
        description="从添加亲属开始，建立您的家族谱系图。S4 阶段将实现完整的家谱树可视化。"
        action={
          <Button onClick={() => navigate('/add-relative')}>
            <UserPlus size={16} />
            添加亲属
          </Button>
        }
      />
    </>
  );
}
