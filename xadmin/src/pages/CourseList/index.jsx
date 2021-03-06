import {DownOutlined, PlusOutlined, EditOutlined,DeleteOutlined} from '@ant-design/icons';
import {Button, Divider, Dropdown, Input, Menu, message, Popconfirm, Select, Switch} from 'antd';
import React, {useEffect,useRef, useState} from 'react';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import ProTable from 'mtianyan-pro-table';
import CreateForm from './components/CreateForm';
import {addCourse, queryCourse, removeCourse, updateCourse} from './service';
import UpdateForm from './components/UpdateForm';
import UploadAvatar from '@/components/UploadAvatar';
import {queryCourseOrg} from '@/pages/CourseOrgList/service';import {queryTeacher} from '@/pages/TeacherList/service';
import moment from 'moment';
const {Option} = Select;
import {BooleanDisplay, dealDateTimeDisplay, dealTime, deepCopy, getObjectClass, getTableColumns, richForm, richTrans, richCol,fileUpload} from '@/utils/utils';
import 'braft-editor/dist/index.css'

const TableList = () => {
  const [createModalVisible, handleModalVisible] = useState(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState(false);
  const [updateFormValues, setUpdateFormValues] = useState({});
  const actionRef = useRef();
  const addFormRef = useRef();
  const updateFormRef = useRef();

  const handleAdd = async fields => {
  const hide = message.loading('正在添加');

  try {
    await addCourse({...fields});
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
      if ('fields_errors' in error.data) {
        for (let key in error.data.fields_errors) {
          var value = error.data.fields_errors[key];
          addFormRef.current.setFields([
            {
              name: key,
              errors: value,
            },
          ]);
        }
      } else {
        message.error('非字段类型错误');
      }
    hide();
    message.error('添加失败');
    return false;
  }
};

  const handleUpdate = async (value, current_id) => {
  const hide = message.loading('正在修改');

  try {
    await updateCourse(value, current_id);
    hide();
    message.success('修改成功');
    return true;
  } catch (error) {
            if ('fields_errors' in error.data) {
        for (let key in error.data.fields_errors) {
          var value = error.data.fields_errors[key];
          updateFormRef.current.setFields([
            {
              name: key,
              errors: value,
            },
          ]);
        }
      } else {
        message.error('非字段类型错误');
      }
    hide();
    message.error('修改失败请重试！');
    return false;
  }
};

  const handleRemove = async selectedRows => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;

  try {
    const ids = selectedRows.map(row => row.id).join(',');
    await removeCourse(ids);
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};
  const dateFieldList = ["add_time"]
  const base_columns = [{
                              title: 'ID',
                              dataIndex: 'id',
                              hideInForm: true,
                              hideInSearch: true,
                              rules: [
                                {
                                  required: true,
                                  message: 'ID为必填项',
                                },
                              ],
                            },{
                          title: '所属机构',
                          dataIndex: 'course_org',
                          backendType: 'foreignKey',
                          rules: [
                            {
                              required: true,
                              message: '所属机构为必填项',
                            },
                          ],
                                renderFormItem: (item, {value, onChange}) => {
        const children = course_orgForeignKeyList.map((item) => {
          return <Option key={item.id} value={item.id}>{item.name}</Option>;
        });
        return <Select
          placeholder="请选择所属机构"
          onChange={onChange}
        >
          {children}
        </Select>;
      },
                        },{
                          title: '讲师',
                          dataIndex: 'teacher',
                          backendType: 'foreignKey',
                          rules: [
                            {
                              required: true,
                              message: '讲师为必填项',
                            },
                          ],
                                renderFormItem: (item, {value, onChange}) => {
        const children = teacherForeignKeyList.map((item) => {
          return <Option key={item.id} value={item.id}>{item.name}</Option>;
        });
        return <Select
          placeholder="请选择讲师"
          onChange={onChange}
        >
          {children}
        </Select>;
      },
                        },{
                  title: '课程名',
                  dataIndex: 'name',
                  rules: [
                    {
                      required: true,
                      message: '课程名为必填项',
                    },
                  ],
                },{
                              title: '课程描述',
                              dataIndex: 'desc',
                            valueType: 'textarea',
                             ellipsis: true,
                              rules: [
                                {
                                  required: true,
                                  message: '课程描述为必填项',
                                },
                              ],
                            },{
                              title: '课程详情',
                              dataIndex: 'detail',
                                  customCol:richCol,
                                  ellipsis: true,
                                                                hideInSearch: true,
                              rules: [
                                {
                                  required: true,
                                  message: '课程详情为必填项',
                                },
                              ],
                                  renderFormItem: (_, {type, defaultRender, ...rest}, form) => {
      return richForm(form, rest.id);
    },
                            },{
                              title: '是否轮播',
                              dataIndex: 'is_banner',
                              rules: [
                                {
                                  required: true,
                                  message: '是否轮播为必填项',
                                },
                              ],
                                  render: (text, record) => {
      return BooleanDisplay(text);
    },
                                  renderFormItem: (_, {type, defaultRender, ...rest}, form) => {
      const is_value = form.getFieldValue('is_banner');
      if (type === "form" && !is_value) {
        form.setFieldsValue({'is_banner': false});
      }
      return <Switch checked={is_value} onClick={(checked) => {
        form.setFieldsValue({'is_banner': checked});
      }} />;
    },
                            },{
                                       title: '难度',
                                       dataIndex: 'degree',
                                       rules: [
                                         {
                                           required: true,
                                           message: '难度为必填项',
                                         },
                                       ],
                                       valueEnum: {
                                         cj:"初级",zj:"中级",gj:"高级"
                                        },
                                     },{
                                  title: '学习时长(分钟数)',
                                  dataIndex: 'learn_times',
                                            valueType: 'digit',
                                  rules: [
                                    {
                                      required: true,
                                      message: '学习时长(分钟数)为必填项',
                                    },
                                  ],
                                },{
                                  title: '学习人数',
                                  dataIndex: 'students',
                                            valueType: 'digit',
                                  rules: [
                                    {
                                      required: true,
                                      message: '学习人数为必填项',
                                    },
                                  ],
                                },{
                                  title: '收藏人数',
                                  dataIndex: 'fav_nums',
                                            valueType: 'digit',
                                  rules: [
                                    {
                                      required: true,
                                      message: '收藏人数为必填项',
                                    },
                                  ],
                                },{
                  title: '课程须知',
                  dataIndex: 'you_need_know',
                  rules: [
                    {
                      required: true,
                      message: '课程须知为必填项',
                    },
                  ],
                },{
                  title: '老师告诉你',
                  dataIndex: 'teacher_tell',
                  rules: [
                    {
                      required: true,
                      message: '老师告诉你为必填项',
                    },
                  ],
                },{
                        title: '封面图',
                        dataIndex: 'image',
                                      render: (text, record) => {
                  return <img src={text} width="80px" alt=""/>
                },
                              hideInSearch: true,
                        rules: [
                          {
                            required: true,
                            message: '封面图为必填项',
                          },
                        ],
                         renderFormItem: (_, {type, defaultRender, ...rest}, form) => {
      const imageUrl = form.getFieldValue('image');
      return <UploadAvatar img={imageUrl}/>
    },
                      },{
                                  title: '点击数',
                                  dataIndex: 'click_nums',
                                            valueType: 'digit',
                                  rules: [
                                    {
                                      required: true,
                                      message: '点击数为必填项',
                                    },
                                  ],
                                },{
                  title: '课程类别',
                  dataIndex: 'category',
                  rules: [
                    {
                      required: true,
                      message: '课程类别为必填项',
                    },
                  ],
                },{
                  title: '课程标签',
                  dataIndex: 'tag',
                  rules: [
                    {
                      required: true,
                      message: '课程标签为必填项',
                    },
                  ],
                },{
          title: '添加时间',
          dataIndex: 'add_time',
          valueType: 'dateTime',
          hideInForm: true,
          rules: [
            {
              required: true,
              message: '添加时间为必填项',
            },
          ],
                                   render: (text, record) => {
      return dealDateTimeDisplay(text);
    },
        },    {
                          title: '操作',
                          dataIndex: 'option',
                          valueType: 'option',
                                fixed: 'right',
      width: 100,
                          render: (text, record) => (
                            <>

                              <EditOutlined title="编辑" className="icon" onClick={async () => {
                                record.add_time = moment(record.add_time);
                                handleUpdateModalVisible(true);
                                setUpdateFormValues(record);
                              }} />
                              <Divider type="vertical" />
                              <Popconfirm
                                title="您确定要删除课程吗？"
                                placement="topRight"
                                onConfirm={() => {
                                  handleRemove([record])
                                  actionRef.current.reloadAndRest();
                                }}
                                okText="确定"
                                cancelText="取消"
                              >
                                <DeleteOutlined title="删除" className="icon" />
                              </Popconfirm>
                            </>
                          ),
                        },];

  let cp = deepCopy(base_columns);
  const table_columns = getTableColumns(cp);

  const update_columns = [...base_columns];

  const create_columns = [...base_columns];

  const [columnsStateMap, setColumnsStateMap] = useState({});

  const [paramState, setParamState] = useState({});

  const [course_orgForeignKeyList, setCourse_orgForeignKeyList] = useState([]);
  useEffect(() => {
    queryCourseOrg().then(value => {
      setCourse_orgForeignKeyList(value.data);
    });
  }, []);const [teacherForeignKeyList, setTeacherForeignKeyList] = useState([]);
  useEffect(() => {
    queryTeacher().then(value => {
      setTeacherForeignKeyList(value.data);
    });
  }, []);


    
  return (
    <PageHeaderWrapper>
      <ProTable
           beforeSearchSubmit={(params => {
                         dealTime(params, dateFieldList);
          return params;
        })}
        params={paramState}
        scroll={{x: '100%'}}
        columnsStateMap={columnsStateMap}
        onColumnsStateChange={(map) => setColumnsStateMap(map)}
        headerTitle="课程表格"
        actionRef={actionRef}
        rowKey="id"
        toolBarRender={(action, {selectedRows}) => [
          <Button type="primary" onClick={() => handleModalVisible(true)}>
            <PlusOutlined /> 新建
          </Button>,
          <Input.Search style={{marginRight: 20}} placeholder="搜索课程 " onSearch={value => {
            setParamState({
              search: value,
            });
            actionRef.current.reload();
          }} />,
          selectedRows && selectedRows.length > 0 && (
            <Dropdown
              overlay={
                <Menu
                  onClick={async e => {
                    if (e.key === 'remove') {
                      await handleRemove(selectedRows);
                      actionRef.current.reloadAndRest();
                    }
                  }}
                  selectedKeys={[]}
                >
                  <Menu.Item key="remove">批量删除</Menu.Item>
                </Menu>
              }
            >
              <Button>
                批量操作 <DownOutlined />
              </Button>
            </Dropdown>
          ),
        ]}
        tableAlertRender={({selectedRowKeys, selectedRows}) => (
          selectedRowKeys.length > 0 ? <div>
            已选择{' '}
            <a
              style={{
                fontWeight: 600,
              }}
            >
              {selectedRowKeys.length}
            </a>{' '}
            项&nbsp;&nbsp;
          </div> : false

        )}
        request={(params, sorter, filter) => queryCourse({...params, sorter, filter})}
        columns={table_columns}
        rowSelection={{}}
      />
      <CreateForm onCancel={() => handleModalVisible(false)} modalVisible={createModalVisible}>
        <ProTable
                     formRef={addFormRef}
          onSubmit={async value => {
                          richTrans(value);
            const success = await handleAdd(value);

            if (success) {
              handleModalVisible(false);

              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          rowKey="key"
          type="form"
                    search={{
                            span: {
                              lg: 12,
                              md: 12,
                              xxl: 12,
                              xl: 12,
                              sm: 12,
                              xs: 24,
                            },
                          }}
          form={
            {
              labelCol: {span: 6},
              labelAlign: 'left',
            }}
          columns={create_columns}
          rowSelection={{}}
        />
      </CreateForm>
      <UpdateForm onCancel={() => handleUpdateModalVisible(false)} modalVisible={updateModalVisible}>
        <ProTable
          formRef={updateFormRef}
          onSubmit={async value => {
                          richTrans(value);
            const success = await handleUpdate(value, updateFormValues.id);

            if (success) {
              handleUpdateModalVisible(false);

              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          rowKey="key"
                    search={{
                            span: {
                              lg: 12,
                              md: 12,
                              xxl: 12,
                              xl: 12,
                              sm: 12,
                              xs: 24,
                            },
                          }}
          type="form"
          form={{
            initialValues: updateFormValues, labelCol: {span: 6},
            labelAlign: 'left',
          }}
          columns={update_columns}
          rowSelection={{}}
        />
      </UpdateForm>
    </PageHeaderWrapper>
  );
};

export default TableList;
