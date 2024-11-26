import { Analysis, NurseMemo } from "../actions/models";

interface Props {
    analysis: Analysis | undefined;
    onClose: () => void;
};

const AnalysisDialog = (props: Props) => {
    const { analysis, onClose } = props;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50">
            <div className="bg-white rounded shadow-lg relative">
                <div className="bg-white p-8 rounded shadow-lg">
                    {analysis && (
                        <>
                            <p className="m-4">{analysis.verbalAnalysis}</p>
                            <p className="m-4">Ehdotuksia Helenan hyvinvoinnin edistämiseksi ja ylläpitämiseksi:
                                <ul className="list-disc  m-4">
                                    {analysis.suggestions.map((suggestion: string, idx: number) =>
                                        (<li key={idx}>{suggestion}</li>))}
                                </ul>
                            </p>
                            <p className="m-4">{`Mieliala: ${analysis.sentimentEstimate}, arvion luotettavuus ${analysis.confidenceLevel}`}</p>
                        </>)
                    }
                </div>
                <button
                    onClick={onClose}
                    className="absolute bottom-4 right-4 z-10 bg-blue-500 text-white p-2 rounded"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

export default AnalysisDialog;