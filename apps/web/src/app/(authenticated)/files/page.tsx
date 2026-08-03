import type { Metadata } from 'next';

import { PageContainer } from '../../../components/ui/index';
import { FileList } from '../../../features/files/file-list';
import { FileUploadForm } from '../../../features/files/file-upload-form';

export const metadata: Metadata = { title: 'Files' };

export default function FilesPage() {
  return (
    <PageContainer>
      <h1>Your files</h1>
      <FileUploadForm />
      <div style={{ marginTop: 'var(--space-6)' }}>
        <FileList />
      </div>
    </PageContainer>
  );
}
