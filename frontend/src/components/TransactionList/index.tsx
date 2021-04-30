import { Table } from 'react-bootstrap';
import { IRecentTx } from '../../models';
import { formatUnixTimestamp } from '../../utils/datetime';

const txToLink = (tx: IRecentTx) => (`https://${tx.network}.etherscan.io/tx/${tx.txHash}`);

const TransactionList = ({ recentTx }: { recentTx: Array<IRecentTx> }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Timestamp</th>
          <th>Description</th>
          <th>Status</th>
          <th>Transaction Details</th>
        </tr>
      </thead>
      <tbody>
        {
          recentTx?.map((tx, index) => {
            return (
              <tr>
                <td>{index+1}</td>
                <td>{formatUnixTimestamp(tx.timestamp)}</td>
                <td>{tx.description}</td>
                <td>{tx.status}</td>
                <td><a href={txToLink(tx)} rel="noreferrer" target="_blank">View on Etherscan</a></td>
              </tr>
            )
          })
        }
      </tbody>
    </Table>
  );
};

export default TransactionList;
