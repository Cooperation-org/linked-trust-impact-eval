import { useState } from "react";
import { useViewerConnection } from "@self.id/framework";
import styles from "../styles/Home.module.css";

export default function Tasks(props) {

    const [claim, setClaim] = useState('');
    const [credit, setCredit] = useState('');
    const [round, setRound] = useState('');

    return (
        <main className={styles.claimMain}>
            <form className={styles.claimForm}>
                <label for="claim">Claim</label>
                <input
                    type="text"
                    placeholder="Task Title"
                    name="claim"
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                />

                <label for="credit">Credit</label>
                <input
                    type="text"
                    placeholder="Cooks"
                    name="credit"
                    value={credit}
                    onChange={(e) => setCredit(e.target.value)}
                />

                <label for="round">Round</label>
                <select
                    name="round"
                    value={round}
                    onChange={(e) => e.target.value=="months" ? setRound("") : setRound(e.target.value)}
                >
                    <option value="months" selected>Months</option>
                    <option value="january">January</option>
                    <option value="february">February</option>
                    <option value="march">March</option>
                    <option value="april">April</option>
                    <option value="may">May</option>
                    <option value="june">June</option>
                    <option value="july">July</option>
                    <option value="august">August</option>
                    <option value="september">September</option>
                    <option value="october">October</option>
                    <option value="november">November</option>
                    <option value="december">December</option>
                </select>
            </form>
        </main>
    );
}