
import React from 'react';
import TabDataSiswa from '../../components/admin/master-data/TabDataSiswa';
import '../../styles/AdminStyles.css';

const MasterDataPage: React.FC = () => {
    return (
        <div className="master-data-page">
            <h1 className="page-title">📚 Master Data - Kelola Akun</h1>

            {/* Direct to TabDataSiswa - no tabs needed */}
            <div className="tab-content">
                <TabDataSiswa />
            </div>
        </div>
    );
};

export default MasterDataPage;
