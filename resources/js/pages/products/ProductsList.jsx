import {
  Button,
  Card,
  Dropdown,
  Input,
  message,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {useStateContext} from "../../contexts/ContextProvider.jsx";
import {useEffect, useRef, useState} from "react";
import Highlighter from "react-highlight-words";
import {
  DeleteFilled, DeleteOutlined,
  DownloadOutlined, DownOutlined,
  EditFilled,
  EllipsisOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import axiosClient from "../../axios-client.js";
import {Link, useNavigate} from "react-router-dom";
import ProductCreateForm from "../../components/forms/ProductCreateForm.jsx";
import ProductUpdateForm from "../../components/forms/ProductUpdateForm.jsx";
import ExportProductModal from "../../components/modals/ExportProductModal.jsx";
import ImportProductModal from "../../components/modals/ImportProductModal.jsx";

const ProductsList = () => {
  const {can} = useStateContext();
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [openCreateForm, setOpenCreateForm] = useState(false);
  const [openUpdateForm, setOpenUpdateForm] = useState(false);
  const [openExportForm, setOpenExportForm] = useState(false);
  const [openImportForm, setOpenImportForm] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [errors, setErrors] = useState({});
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const [searchedInfo, setSearchedInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  const [editLoadings, setEditLoadings] = useState([]);

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      pageSizeOptions: ["10", "25", "50", "100", "500", "1000"],
      showQuickJumper: true,
    },
  });

  useEffect(() => {
    if (!can("products.index")) {
      navigate("/forbidden");
    }
  }, []);

  useEffect(() => {
    getProducts();
  }, [JSON.stringify(tableParams)]);

  const getColumns = () => [
    {
      title: "ID",
      width: 80,
      dataIndex: "id",
      key: "id",
      sorter: true,
      sortOrder: sortedInfo.columnKey === "id" ? sortedInfo.order : null,
      filteredValue: searchedInfo.id || null,
      ...getColumnSearchProps("id"),
    },
    {
      title: "SKU",
      width: 300,
      dataIndex: "sku",
      key: "sku",
      sorter: true,
      sortOrder: sortedInfo.columnKey === "sku" ? sortedInfo.order : null,
      filteredValue: searchedInfo.sku || null,
      ...getColumnSearchProps("sku"),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortOrder: sortedInfo.columnKey === "name" ? sortedInfo.order : null,
      filteredValue: searchedInfo.name || null,
      ...getColumnSearchProps("name"),
    },
    {
      title: "Categories",
      dataIndex: "categories",
      sorter: true,
      key: "categories",
      sortOrder:
        sortedInfo.columnKey === "categories" ? sortedInfo.order : null,
      filteredValue: searchedInfo.categories || null,
      ...getColumnSearchProps("categories"),
      render: (_, render) => (
        <Space size={[0, 4]} wrap>
          {render.categories.slice(0, 2).map((category, i) => {
            return (
              <span>
                <Link to={`/categories/${category.id}`}>
                  <Tag color="default">{category.name}</Tag>
                </Link>
              </span>
            );
          })}
          {render.categories.length > 2 ? "..." : ""}
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      sorter: true,
      key: "type",
      sortOrder: sortedInfo.columnKey === "type" ? sortedInfo.order : null,
      filteredValue: searchedInfo.type || null,
      ...getColumnSearchProps("type"),
      render: (_, render) => {
        return render.type.name;
      },
    },
    {
      title: "Selling Price",
      dataIndex: "selling_price",
      sorter: true,
      key: "selling_price",
      sortOrder:
        sortedInfo.columnKey === "selling_price" ? sortedInfo.order : null,
      filteredValue: searchedInfo.selling_price || null,
      ...getColumnSearchProps("selling_price"),
      render: (_, render) => {
        return render.selling_price + " $";
      },
    },
    {
      title: "Actions",
      align: "center",
      width: 80,
      render: (_, render) => (
        <Space size="small">
          {can("products.update") && (
            <Tooltip placement="top" title="Edit">
              <Button
                size="small"
                loading={editLoadings[render.id] || false}
                onClick={() => showUpdateProductForm(render.id)}
                icon={<EditFilled style={{color: "#456cec"}}/>}
              />
            </Tooltip>
          )}
          {can("products.destroy") && (
            <Popconfirm
              placement="topLeft"
              title="Are you sure to delete this product"
              onConfirm={() => handleProductDelete(render.id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip placement="top" title="Delete">
                <Button
                  size="small"
                  icon={<DeleteFilled style={{color: "#ec4545"}}/>}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const getProducts = () => {
    setLoading(true);
    axiosClient
      .get("/products", {
        params: getTableParams(tableParams),
      })
      .then(({data}) => {
        setProducts(data.data);
        setLoading(false);
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            current: data.meta.current_page,
            pageSize: data.meta.per_page,
            total: data.meta.total,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          },
        });
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const enterEditLoading = (id, value) => {
    setEditLoadings((prevLoadings) => {
      let newLoadings = [...editLoadings];
      newLoadings[id] = value;
      return newLoadings;
    });
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
                       setSelectedKeys,
                       selectedKeys,
                       confirm,
                       clearFilters,
                       close,
                     }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 0,
            width: 300,
            display: "block",
          }}
        />
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#444444",
            color: "#fff",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const clearAll = () => {
    setSearchedInfo({});
    setSortedInfo({});
    setSearchText("");
    setSearchedColumn("");
    setTableParams({});
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setSearchedInfo(filters);
    setSortedInfo(sorter);

    setTableParams({
      pagination,
      filters,
      ...sorter,
    });

    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setProducts([]);
    }
  };

  const getTableParams = (params) => ({
    ...params,
  });

  // Handle product creating.
  const handleProductCreate = (values) => {
    showLoadingMessage("Creating...");

    axiosClient
      .post("/products", values)
      .then(({data}) => {
        setOpenCreateForm(false);
        getProducts();
        showMessage("success", "Product successfully created!");
      })
      .catch(({response}) => {
        const err = response?.data?.errors;
        if (err) {
          setErrors(err);
        }
        const msg = response?.data?.message;
        if (msg && !err) {
          showMessage("error", "Failed to create product: " + msg);
        }
      });
  };

  const showUpdateProductForm = (productId) => {
    enterEditLoading(productId, true);

    axiosClient
      .get("/products/" + productId)
      .then(({data}) => {
        setProduct(data);
        setOpenUpdateForm(true);
        enterEditLoading(productId, false);
      })
      .catch(({response}) => {
        showMessage("error", response?.data?.message);
      });
  };

  // Handle product updating.
  const handleProductUpdate = (productId, values) => {
    showLoadingMessage("Updating...");

    axiosClient
      .put("/products/" + productId, values)
      .then(({data}) => {
        setOpenUpdateForm(false);
        getProducts();
        showMessage("success", "Product successfully updated!");
      })
      .catch(({response}) => {
        const err = response?.data?.errors;
        if (err) {
          setErrors(err);
        }
        const msg = response?.data?.message;
        if (msg && !err) {
          showMessage("error", "Failed to update product: " + msg);
        }
      });
  };

  // Handle product deleting.
  const handleProductDelete = (productId) => {
    showLoadingMessage("Deleting...");

    axiosClient
      .delete("/products/" + productId)
      .then(({data}) => {
        getProducts();
        showMessage("success", "Product successfully deleted!");
      })
      .catch(({response}) => {
        showMessage("error", "Failed to delete product");
      });
  };

  const handleErrors = () => {
    setErrors(errors);
  };

  const showLoadingMessage = (content) => {
    messageApi.open({
      key: "updatable",
      type: "loading",
      content: content,
    });
  };

  const showMessage = (type, content) => {
    messageApi.open({
      key: "updatable",
      type: type,
      content: content,
    });
  };

  const handleAdditionalMenu = (e) => {
    const menuKey = e.key;

    switch (menuKey) {
      case "1":
        return showExportModal();
      case "2":
        return showImportModal();
      case "3":
        return clearAll();
      default:
        return;
    }
  };

  const showExportModal = () => {
    setOpenExportForm(true);
  };

  const handleExport = (values) => {
    setExportLoading(true);
    messageApi.open({
      type: "loading",
      content: "Exporting, please wait...",
      duration: 0,
    });

    axiosClient
      .post("/products/export", values, {responseType: "blob"})
      .then(({data}) => {
        messageApi.destroy();
        messageApi.success("Export successfully done!");
        setOpenExportForm(false);
        setExportLoading(false);

        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement("a");
        link.href = url;
        const date = new Date();
        link.setAttribute(
          "download",
          `${date.toLocaleDateString()}-${date.toLocaleTimeString()}-products.${
            values.export_as
          }`,
        );
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch((err) => {
        messageApi.destroy();
        setExportLoading(false);
        console.log(err);
      });
  };

  const showImportModal = () => {
    setOpenImportForm(true);
  };

  const handleImport = (values) => {
  };

  const handleBulkDelete = () => {
    axiosClient
      .delete('/products/bulk-delete?ids=' + selectedRowKeys.join(','))
      .then(({data}) => {
        messageApi.success(data.message);
        setSelectedRowKeys([]);
        getProducts();
      })
      .catch((err) => {
        messageApi.error(err.message);
      })
  }

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    type: "checkbox",
  };
  const hasSelected = selectedRowKeys.length > 0;

  const handleBulkActionsItemClick = (e) => {
    if (e.key === '2') {
      handleBulkDelete();
    }
  }

  return (
    <Card
      type="inner"
      title="Products"
      extra={
        <Space>
          <Dropdown
            trigger="click"
            menu={{
              items: [{
                label: "Delete",
                key: "2",
                icon: <DeleteOutlined/>,
                danger: true,
              }],
              onClick: handleBulkActionsItemClick
            }}
          >
            <Button style={{
              display: hasSelected ? "inline-block" : "none",
            }} size="small">
              <Space>
                Bulk Actions
                <DownOutlined/>
              </Space>
            </Button>
          </Dropdown>

          {can("products.store") ? (
            <Button
              size="small"
              type="primary"
              onClick={() => {
                setOpenCreateForm(true);
              }}
            >
              <PlusOutlined/>
              New
            </Button>
          ) : null}

          <Dropdown.Button
            size="large"
            trigger="click"
            menu={{
              items: [
                {
                  label: "Export",
                  key: "1",
                  icon: <UploadOutlined/>,
                },
                {
                  label: "Import",
                  key: "2",
                  icon: <DownloadOutlined/>,
                },
                {
                  type: 'divider',
                },
                {
                  label: "Refresh List",
                  key: "3",
                  icon: <SyncOutlined/>,
                },
              ],
              onClick: handleAdditionalMenu,
            }}
            buttonsRender={([leftButton, rightButton]) => [
              null,
              <Button size="small" icon={<EllipsisOutlined/>}></Button>,
            ]}
          ></Dropdown.Button>
        </Space>
      }
    >
      {contextHolder}

      <Table
        rowSelection={rowSelection}
        columns={getColumns()}
        rowKey={(record) => record.id}
        dataSource={products}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{y: 600, x: 500}}
        size="small"
      />

      <ProductUpdateForm
        open={openUpdateForm}
        product={product}
        onUpdate={handleProductUpdate}
        onCancel={() => setOpenUpdateForm(false)}
        errors={errors}
        setErrors={setErrors}
      />

      <ProductCreateForm
        open={openCreateForm}
        onCreate={handleProductCreate}
        onCancel={() => setOpenCreateForm(false)}
        errors={errors}
        onError={handleErrors}
      />

      <ExportProductModal
        open={openExportForm}
        loading={exportLoading}
        onExport={handleExport}
        onCancel={() => setOpenExportForm(false)}
        errors={errors}
      />

      <ImportProductModal
        open={openImportForm}
        updateProducts={getProducts}
        loading={importLoading}
        onImport={handleImport}
        onCancel={() => setOpenImportForm(false)}
        errors={errors}
      />
    </Card>
  );
};

export default ProductsList;
