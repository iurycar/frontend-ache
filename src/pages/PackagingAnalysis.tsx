import React, { useState } from 'react';
import Layout from '../components/Layout';
import SpreadsheetImporter from '../components/SpreadsheetImporter';
import SpreadsheetViewer from '../components/SpreadsheetViewer';

const PackagingAnalysis: React.FC = () => {
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string | undefined>();
  const [reloadTrigger, setReloadTrigger] = useState(0);
  
  return (
    <Layout title="Planilhas Importadas">
      <div className="space-y-6">
        <SpreadsheetImporter onImportComplete={() => setReloadTrigger((v) => v + 1)} />
        <SpreadsheetViewer 
          selectedSpreadsheetId={selectedSpreadsheetId}
          onSpreadsheetSelect={setSelectedSpreadsheetId}
          onBackToList={() => setSelectedSpreadsheetId(undefined)}
          reloadTrigger={reloadTrigger}
        />
      </div>
    </Layout>
  );
};

export default PackagingAnalysis;