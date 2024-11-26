import { NurseMemo } from "../actions/models";

interface Props {
    nurseMemo: NurseMemo;
    onClose: () => void;
};

const NurseMemoDialog = (props: Props) => {
    const { nurseMemo, onClose } = props;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50">
            <div className="bg-white rounded shadow-lg relative">
                <div className="bg-white p-8 rounded shadow-lg">
                    <h2 className="text-xl mb-4">Hoitajan muistio kotikäynnille</h2>
                    <p className="m-4">Osoite: {nurseMemo.client_address}</p>
                    <p className="m-4">Aika: {nurseMemo.visit_time}</p>
                    <p className="m-4">Hyvinvoinnin tila: {nurseMemo.client_health}</p>
                    <p className="m-4">Asiakkaan toiveet:
                        <ul className="list-disc  m-4">
                            {nurseMemo.client_wishes.map((wish: string, idx: number) =>
                                (<li key={idx}>{wish}</li>))}
                        </ul>
                    </p>
                    <p className="m-4">Puheenaiheita:
                        <ul className="list-disc m-4">
                            {nurseMemo.conversation_topics.map((topic: string, idx: number) =>
                                (<li key={idx}>{topic}</li>))}
                        </ul>
                    </p>
                    <p className="m-4">Toimenpiteet:
                        <ul className="list-disc m-4">
                            {nurseMemo.actions.map((action: string, idx: number) =>
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