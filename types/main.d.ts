type ContributeData = {
    name: string;
    alias: Array<string>;
};

type InternalContributeData = {
    name: string;
    alias: Array<{ contributor: string; alia: string }>;
};

type ArcadeData = {
    _id: import('mongodb').ObjectId;
    type: string;
    data: InternalContributeData[];
};
