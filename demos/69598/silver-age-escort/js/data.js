const mockData = {
    toilets: [
        {
            id: 't1',
            name: '人民广场站-3号口厕所',
            station: '人民广场站',
            line: '1/2/8号线',
            location: '3号口附近 B1层',
            distance: '200m',
            accessibility: {
                has_barrier_free: true,
                has_toilet_seat: true,
                has_L_handrail: true,
                has_call_button: true
            },
            status: 'available',
            floor: 'B1层',
            phone: '021-63189888'
        },
        {
            id: 't2',
            name: '人民广场站-7号口厕所',
            station: '人民广场站',
            line: '1/2/8号线',
            location: '7号口旁 1层',
            distance: '450m',
            accessibility: {
                has_barrier_free: false,
                has_toilet_seat: true,
                has_L_handrail: false,
                has_call_button: true
            },
            status: 'available',
            floor: '1层',
            phone: '021-63189888'
        },
        {
            id: 't3',
            name: '徐家汇站-1号口厕所',
            station: '徐家汇站',
            line: '1/9/11号线',
            location: '1号口附近 B2层',
            distance: '1.2km',
            accessibility: {
                has_barrier_free: true,
                has_toilet_seat: true,
                has_L_handrail: true,
                has_call_button: true
            },
            status: 'available',
            floor: 'B2层',
            phone: '021-64384000'
        },
        {
            id: 't4',
            name: '静安寺站-2号口厕所',
            station: '静安寺站',
            line: '2/7号线',
            location: '2号口旁 B1层',
            distance: '1.8km',
            accessibility: {
                has_barrier_free: true,
                has_toilet_seat: true,
                has_L_handrail: false,
                has_call_button: true
            },
            status: 'maintenance',
            floor: 'B1层',
            phone: '021-62888888'
        },
        {
            id: 't5',
            name: '南京东路站-5号口厕所',
            station: '南京东路站',
            line: '1/2号线',
            location: '5号口附近 B1层',
            distance: '2.1km',
            accessibility: {
                has_barrier_free: true,
                has_toilet_seat: true,
                has_L_handrail: true,
                has_call_button: true
            },
            status: 'available',
            floor: 'B1层',
            phone: '021-63218888'
        }
    ],
    services: [
        { id: 's1', type: 'medical', name: '人民广场站医务室', station: '人民广场站', location: '1号口旁', distance: '50m', phone: '021-63189999', hours: '08:00-18:00' },
        { id: 's2', type: 'medical', name: 'AED设备-3号口', station: '人民广场站', location: '3号口自动扶梯旁', distance: '100m', phone: '', hours: '24小时' },
        { id: 's3', type: 'elevator', name: '无障碍电梯-5号口', station: '人民广场站', location: '5号口', distance: '150m', phone: '', hours: '运营时间' },
        { id: 's4', type: 'canteen', name: '长者饭堂-人民广场店', station: '人民广场站', location: '8号口外200米', distance: '350m', phone: '021-63217777', hours: '11:00-13:30' },
        { id: 's5', type: 'rest', name: '爱心休息区', station: '人民广场站', location: '2号线候车厅', distance: '200m', phone: '', hours: '运营时间' },
        { id: 's6', type: 'medical', name: '徐家汇站医务室', station: '徐家汇站', location: '9号口旁', distance: '1.2km', phone: '021-64385555', hours: '08:00-18:00' },
        { id: 's7', type: 'elevator', name: '无障碍电梯-11号口', station: '徐家汇站', location: '11号口', distance: '1.2km', phone: '', hours: '运营时间' }
    ],
    user: {
        name: '张大爷',
        age: 72,
        phone: '138****8000',
        emergency_contact: {
            name: '张小华',
            phone: '139****9000',
            relation: '儿子'
        },
        preferences: {
            font_size: 'large',
            voice_enabled: true,
            dialect: 'mandarin'
        }
    }
};

const serviceTypeMap = {
    medical: { icon: '🏥', label: '医疗站点', color: '#E63946' },
    elevator: { icon: '♿', label: '无障碍设施', color: '#3498DB' },
    canteen: { icon: '🍚', label: '长者饭堂', color: '#F39C12' },
    rest: { icon: '🪑', label: '休息区', color: '#2ECC71' }
};

const facilityLabels = {
    has_barrier_free: { label: '无障碍', icon: '♿' },
    has_toilet_seat: { label: '坐便器', icon: '🚽' },
    has_L_handrail: { label: 'L型扶手', icon: '🪜' },
    has_call_button: { label: '呼叫按钮', icon: '📞' }
};
