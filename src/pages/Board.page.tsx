import { BoardPage } from '@/components';
import { useParams } from 'react-router-dom';

export default function Component() {
  const { projectId } = useParams();
  return projectId && <BoardPage projectId={projectId} />;
}
