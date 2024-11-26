import { NurseMemo } from "../actions/models";

interface Props {
    process: string;
};

const ProcessingDialog = (props: Props) => {
    const { process } = props;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded shadow-lg">
            <h2 className="text-xl mb-4">{process}</h2>
        </div>
    </div>
);
}

export default ProcessingDialog;