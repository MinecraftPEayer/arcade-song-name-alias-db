'use client';

import { Suspense } from 'react';
import Main from './components/main';

const Page = () => {
    return (
        <div className="h-full flex justify-center content-center flex-wrap">
            <Suspense>
                <Main />
            </Suspense>
        </div>
    );
};

export default Page;
