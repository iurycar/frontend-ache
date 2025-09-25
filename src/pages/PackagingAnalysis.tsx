import React, { useState } from 'react';
import Layout from '../components/Layout';
import SpreadsheetImporter from '../components/SpreadsheetImporter';
import SpreadsheetViewer from '../components/SpreadsheetViewer';

const PackagingAnalysis: React.FC = () => {
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string | undefined>();


  return (
    <Layout title="Planilhas Importadas">
      <div className="space-y-6">
        <SpreadsheetImporter />
        <SpreadsheetViewer 
          selectedSpreadsheetId={selectedSpreadsheetId}
          onSpreadsheetSelect={setSelectedSpreadsheetId}
          onBackToList={() => setSelectedSpreadsheetId(undefined)}
        />
      </div>
    </Layout>
  );
};

export default PackagingAnalysis;