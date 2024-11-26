import { NurseMemo, NurseVisitReport } from "../actions/models";

interface Props {
    visitReport: NurseVisitReport;
    onClose: () => void;
};

const NurseMemoDialog = (props: Props) => {
    const { visitReport, onClose } = props;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50">
            <div className="bg-white rounded shadow-lg relative">
                <div className="bg-white p-8 rounded shadow-lg">
                    <h2 className="text-xl mb-4">Raportti kotikäynnistä</h2>
                    <p className="m-4">{visitReport.report}</p>
                    <p className="m-4">Verenpaine: {visitReport.blood_pressure}</p>
                    <p className="m-4">Verensokeri: {visitReport.blood_sugar}</p>
                    <p className="m-4">Tehdyt toimentpiteet:
                        <ul className="list-disc  m-4">
                            {visitReport.actions.map((action: string, idx: number) =>
                                (<li key={idx}>{action}</li>))}
                        </ul>
                    </p>
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

export default NurseMemoDialog;