import { Table, Row, Col, Button } from 'react-bootstrap';
import { IRecentTx } from '../../models';
import { formatUnixTimestamp } from '../../utils/datetime';
import { BsFillTrashFill } from 'react-icons/bs';
import { NoParamCallback } from '../../utils/optional-type';

const txToLink = (tx: IRecentTx) =>
  `https://${tx.network}.etherscan.io/tx/${tx.txHash}`;

const renderPlaceholder = () => {
  return (
    <tr>
      <td colSpan={5}>
        <span style={{ display: 'block', textAlign: 'center' }}>
          No Transactions
        </span>
      </td>
    </tr>
  );
};

const renderTxList = (recentTx: Array<IRecentTx>) => {
  return recentTx.map((tx, index) => {
    return (
      <tr>
        <td>{index + 1}</td>
        <td>{formatUnixTimestamp(tx.timestamp)}</td>
        <td>{tx.description}</td>
        <td>{tx.status}</td>
        <td>
          <a href={txToLink(tx)} rel="noreferrer" target="_blank">
            View on Etherscan
          </a>
        </td>
      </tr>
    );
  });
}
const TransactionPanel = ({
  recentTx,
  onEmptyList,
}: {
  recentTx: Array<IRecentTx>;
  onEmptyList?: NoParamCallback;
}) => {
  return (
    <>
      <Row className="justify-content-md-center">
        <Col className="recent-tx" style={{ width: '300px' }}>
          <h4>Recent Transactions</h4>
          <Button onClick={onEmptyList} size="sm" variant="outline-secondary">
            <BsFillTrashFill />
          </Button>
        </Col>
      </Row>
      <Row>
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
            {recentTx.length !== 0 ? renderTxList(recentTx) : renderPlaceholder()}
          </tbody>
        </Table>
      </Row>
    </>
  );
};

export default TransactionPanel;
