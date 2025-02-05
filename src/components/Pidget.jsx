import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Button,
  Input,
  Select,
  SelectItem,
  DatePicker,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  useDisclosure,
  ModalBody,
  Card,
  CardBody,
  CircularProgress,
  Chip,
  CardFooter,
  Pagination,
} from '@nextui-org/react';
import { useMemo } from 'react';
import axios from 'axios';
import DataCountChip from './DataCountChip';

const columns = [
  {
    key: 'colorExpression',
    label: '',
  },
  {
    key: 'messageType',
    label: 'Message Type',
    sortable: true,
  },
  {
    key: 'objectType',
    label: 'Object Type',
    sortable: true,
  },
  {
    key: 'objectId',
    label: 'Object Id',
    sortable: true,
  },
  {
    key: 'runDate',
    label: 'Run Date',
    sortable: false,
  },
  /*   {
    key: 'description',
    label: 'Description',
    sortable: true,
  }, */
  {
    key: 'messageText',
    label: 'Message Text',
    sortable: true,
  },
];

const messageTypeOptions = [
  { type: 'Error', uid: 'E' },
  { type: 'Warning', uid: 'W' },
  { type: 'Information', uid: 'I' },
  { type: 'Success', uid: 'S' },
];
const objectTypeOptions = [
  { type: 'Employee Data', uid: 'P' },
  { type: 'Organizational Information', uid: 'OM' },
];

export default function Pidget() {
  const [filterValueObjectId, setFilterValueObjectId] = useState('');
  const [filterValueMessageText, setFilterValueMessageText] = useState('');
  const [selectedMessageTypes, setSelectedMessageTypes] = useState([
    ...messageTypeOptions,
  ]);
  const [selectedObjectTypes, setSelectedObjectTypes] = useState([
    ...objectTypeOptions,
  ]);
  const [filterDateFrom, setFilterDateFrom] = useState();
  const [filterDateTo, setFilterDateTo] = useState();
  const [sortedItems, setSortedItems] = useState([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [loadedRecordsCount, setLoadedRecordsCount] = useState(0);
  const [rows, setRows] = useState([]);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'messageType',
    direction: 'ascending',
  });
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [modalContent, setModalContent] = useState({
    header: 'Loading Integration Logs...',
    showFooter: false,
  });

  //Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const integrationLogs = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return rows.slice(start, end);
  }, [page, rows]);
  const pages = Math.ceil(rows.length / rowsPerPage);

  function prepareData(data) {
    return data.map((item) => {
      let messageTypeText = '';
      let objectType = '';

      switch (item.cust_messageType) {
        case 'E':
          messageTypeText = 'Error';
          break;
        case 'I':
          messageTypeText = 'Information';
          break;
        case 'W':
          messageTypeText = 'Warning';
          break;
        case 'S':
          messageTypeText = 'Success';
          break;
        default:
          messageTypeText = 'Error';
      }

      switch (item.cust_oType) {
        case 'OM':
          objectType = 'Organizational Information';
          break;
        case 'P':
          objectType = 'Employee Data';
          break;
        default:
          objectType = 'Other';
      }

      const timestamp = parseInt(item.cust_rdate.match(/\d+/)[0], 10);
      const date = new Date(timestamp);

      return {
        key: item.externalCode,
        messageType: messageTypeText,
        objectType: objectType,
        objectId: item.cust_objectId,
        runDate: date.toLocaleString(),
        /* description: item.cust_description, */
        messageText: item.cust_messageText,
      };
    });
  }

  function formatTwoDigit(number) {
    return number < 10 ? '0' + number : number;
  }

  /*   function transformUrl(originalUrl) {
    const startIndex = originalUrl.indexOf('//') + 2;
    const endIndex = originalUrl.indexOf('/', startIndex);
    return originalUrl.substring(endIndex);
  } */

  function getIntegrationLogs() {
    setRecordsCount(0);
    const fetchData = async () => {
      const formatDate = (date) => {
        return date
          ? `${date.year}-${formatTwoDigit(date.month)}-${formatTwoDigit(date.day)}`
          : '';
      };

      const buildFilterString = () => {
        const messageTypeString = Array.from(selectedMessageTypes)
          .map((type) => `'${type}'`)
          .join(',');
        const objectTypeString = Array.from(selectedObjectTypes)
          .map((type) => `'${type}'`)
          .join(',');
        const runDateFromString = filterDateFrom
          ? `and cust_rdate ge '${formatDate(filterDateFrom)}T00:00:00.000Z'`
          : '';
        const runDateToString = filterDateTo
          ? `and cust_rdate le '${formatDate(filterDateTo)}T23:59:00.000Z'`
          : '';
        const messageTextString = filterValueMessageText
          ? `and tolower(cust_messageText) like '%25${filterValueMessageText.toLocaleLowerCase()}%25'`
          : '';
        const objectIdString = filterValueObjectId
          ? `and tolower(cust_objectId) like '%25${filterValueObjectId.toLocaleLowerCase()}%25'`
          : '';

        return `$filter=cust_oType in ${objectTypeString} and cust_messageType in ${messageTypeString} ${runDateFromString} ${runDateToString} ${messageTextString} ${objectIdString}`;
      };

      const countUrl = `${import.meta.env.VITE_API_SAPREPLICATIONLOGDETAILS_BASE}/$count?${buildFilterString()}`;
      let count = 0;

      try {
        setModalContent({
          ...modalContent,
          header: 'Counting Integration Logs...',
          showFooter: false,
        });
        const response = await axios.get(countUrl);
        count = parseInt(response.data, 10);
        if (!isNaN(count)) {
          setRecordsCount(count);
        }
      } catch (error) {
        console.log('Error counting integration logs', error);
      }

      if (count >= 0 && count < 100000) {
        let next = true;
        let url = `${import.meta.env.VITE_API_SAPREPLICATIONLOGDETAILS_BASE}${import.meta.env.VITE_API_SAPREPLICATIONLOGDETAILS}&${buildFilterString()}`;
        let recordsArr = [];
        setModalContent({
          ...modalContent,
          header: 'Loading Integration Logs...',
          showFooter: false,
        });

        do {
          try {
            const response = await axios.get(url);
            if (response.data.d) {
              recordsArr.push(...prepareData(response.data.d.results));
              setLoadedRecordsCount(recordsArr.length);
            }
            if (response.data.d.__next) {
              url = response.data.d.__next;
            } else {
              next = false;
            }
          } catch (error) {
            console.log('Error fetching data', error);
            next = false;
          }
        } while (next);

        setRows(recordsArr);
        setPage(1);
        onOpenChange();
      } else {
        //console.log('Counted Records: ', recordsCount);
        setModalContent({ header: 'Too many records', showFooter: true });
      }
      setLoadedRecordsCount(0);
    };
    fetchData();
  }

  /* const filteredItems = useMemo(() => {
    console.log('Filtering Items');
    let filteredRows = [...rows];

    //Live filter
    //Filter Object Id
    filteredRows = filteredRows.filter((item) =>
      item.objectId.includes(filterValueObjectId),
    );
    //Filter Object Type
    if (selectedObjectTypes.length !== objectTypeOptions.length) {
      filteredRows = filteredRows.filter((item) =>
        Array.from(selectedObjectTypes).includes(item.objectType),
      );
    }
    //Filter Message Text
    filteredRows = filteredRows.filter((item) =>
      item.messageText.includes(filterValueMessageText),
    );
    //Filter Message Types
    if (Array.from(selectedMessageTypes).length !== messageTypeOptions.length) {
      filteredRows = filteredRows.filter((item) =>
        Array.from(selectedMessageTypes).includes(item.messageType),
      );
    }

    return filteredRows;
  }, [
    rows,
    filterValueObjectId,
    selectedMessageTypes,
    selectedObjectTypes,
    filterValueMessageText,
  ]); */

  useEffect(() => {
    //console.log('SORTING...');
    setRows(
      [...rows].sort((a, b) => {
        const first = a[sortDescriptor.column];
        const second = b[sortDescriptor.column];
        const cmp = first < second ? -1 : first > second ? 1 : 0;
        return sortDescriptor.direction === 'descending' ? -cmp : cmp;
      }),
    );
  }, [sortDescriptor]);

  const onObjectIdSearchChange = useCallback((value) => {
    if (value) {
      setFilterValueObjectId(value);
    } else {
      setFilterValueObjectId('');
    }
  }, []);

  const onMessageTextSearchChange = useCallback((value) => {
    if (value) {
      setFilterValueMessageText(value);
    } else {
      setFilterValueMessageText('');
    }
  }, []);

  return (
    <div className="">
      <div className="flex flex-col">
        <div className="grid grid-cols-3 gap-3 mt-5 ml-5 mr-5 mb-3">
          <Select
            label="Message Type"
            placeholder="Select message type"
            selectionMode="multiple"
            defaultSelectedKeys="all"
            disallowEmptySelection
            size="sm"
            onSelectionChange={setSelectedMessageTypes}
          >
            {messageTypeOptions.map((messageType) => (
              <SelectItem
                key={messageType.uid}
                value={messageType.uid}
                startContent={
                  messageType.type === 'Error' ? (
                    <XCircleIcon className="h-6 text-red-400" />
                  ) : messageType.type === 'Warning' ? (
                    <ExclamationCircleIcon className="h-6 text-yellow-400" />
                  ) : messageType.type === 'Information' ? (
                    <InformationCircleIcon className="h-6 text-blue-400" />
                  ) : messageType.type === 'Success' ? (
                    <CheckCircleIcon className="h-6 text-green-400" />
                  ) : (
                    ''
                  )
                }
              >
                {messageType.type}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Object Type"
            placeholder="Select object type"
            selectionMode="multiple"
            defaultSelectedKeys="all"
            disallowEmptySelection
            size="sm"
            onSelectionChange={setSelectedObjectTypes}
          >
            {objectTypeOptions.map((objectType) => (
              <SelectItem key={objectType.uid} value={objectType.uid}>
                {objectType.type}
              </SelectItem>
            ))}
          </Select>
          <Input
            isClearable
            label="Object Id"
            size="sm"
            value={filterValueObjectId}
            onValueChange={onObjectIdSearchChange}
            onClear={() => setFilterValueObjectId('')}
          />
          <DatePicker
            label="Run Date (from)"
            size="sm"
            onChange={setFilterDateFrom}
            value={filterDateFrom}
          />
          <DatePicker
            label="Run Date (to)"
            size="sm"
            onChange={setFilterDateTo}
            value={filterDateTo}
          />
          <Input
            isClearable
            label="Message Text"
            size="sm"
            value={filterValueMessageText}
            onValueChange={onMessageTextSearchChange}
            onClear={() => setFilterValueMessageText('')}
          />
        </div>
        <div className="flex place-self-end mb-3">
          <div className="grid grid-cols-2 gap-3 mr-5">
            <Button
              startContent={<DocumentMagnifyingGlassIcon className=" h-6" />}
              className="bg-slate-300"
              radius="sm"
              onClick={getIntegrationLogs}
              onPress={onOpen}
            >
              Search
            </Button>
            <Button
              startContent={<XCircleIcon className="h-6" />}
              className="bg-slate-300"
              radius="sm"
              onClick={() => {
                setFilterValueObjectId('');
                setFilterValueMessageText('');
                setFilterDateFrom(null);
                setFilterDateTo(null);
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>

        <div className="flex justify-end ml-5 mr-5 mb-5">
          <DataCountChip
            chipcontent={
              'Displaying ' + rows.length.toLocaleString() + ' records'
            }
          />
        </div>
        <div className=" bg-slate-600">
          <Table
            isHeaderSticky
            selectionMode="single"
            color="secondary"
            radius="none"
            emptyContent={'No rows to display.'}
            aria-label="Table with integration logs"
            /* onRowAction={(key) => alert(`Opening log ${key}...`)} */
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
            bottomContent={
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="secondary"
                  page={page}
                  total={pages}
                  onChange={(page) => setPage(page)}
                />
              </div>
            }
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.key}
                  allowsSorting={column.sortable}
                  width={column.key === 'colorExpression' ? '2' : ''}
                  className={column.key === 'colorExpression' ? 'p-0' : ''}
                >
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={integrationLogs}
              emptyContent={'No rows to display.'}
            >
              {(item) => (
                <TableRow
                  key={item.key}
                  className={
                    item.messageType === 'Error'
                      ? 'bg-red-50'
                      : item.messageType === 'Success'
                        ? 'bg-green-50'
                        : item.messageType === 'Information'
                          ? 'bg-blue-50'
                          : item.messageType === 'Warning'
                            ? ' bg-yellow-50'
                            : ''
                  }
                >
                  {(columnKey) =>
                    columnKey === 'colorExpression' ? (
                      <TableCell
                        className={[
                          'p-0',
                          item.messageType === 'Warning'
                            ? 'bg-yellow-400'
                            : item.messageType === 'Success'
                              ? 'bg-green-400'
                              : item.messageType === 'Information'
                                ? 'bg-blue-400'
                                : item.messageType === 'Error'
                                  ? 'bg-red-400'
                                  : '',
                        ].join(' ')}
                      ></TableCell>
                    ) : (
                      <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                    )
                  }
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="bg-gradient-to-tr from-blue-100 via-blue-300 to-blue-500"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        radius="sm"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-white">
                {modalContent.header}
              </ModalHeader>
              <ModalBody className="flex justify-center items-center h-screen">
                <Card className="w-[240px] h-[240px] bg-inherit" shadow="none">
                  <CardBody className="justify-center items-center pb-0">
                    <CircularProgress
                      aria-label="Loading..."
                      classNames={{
                        svg: 'w-36 h-36 drop-shadow-md',
                        indicator: 'stroke-white',
                        track: 'stroke-white/10',
                        value: 'text-3xl font-semibold text-white',
                      }}
                      value={
                        recordsCount == 0
                          ? 0
                          : (loadedRecordsCount / recordsCount) * 100
                      }
                      strokeWidth={4}
                      showValueLabel={true}
                    />
                  </CardBody>
                  <CardFooter className="justify-center items-center pt-0">
                    <Chip
                      classNames={{
                        base: 'border-1 border-white/30',
                        content: 'text-white/90 text-small font-semibold',
                      }}
                      variant="bordered"
                    >
                      {loadedRecordsCount.toLocaleString()} of{' '}
                      {recordsCount.toLocaleString()} logs read
                    </Chip>
                  </CardFooter>
                </Card>
              </ModalBody>
              {modalContent.showFooter && (
                <ModalFooter className="flex justify-center">
                  <Button color="danger" radius="sm" onClick={onOpenChange}>
                    Cancel
                  </Button>
                </ModalFooter>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
