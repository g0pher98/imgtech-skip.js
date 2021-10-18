/*
 * ver 2021
 * Usage : 이수 과목 리스트가 보이는 페이지의 개발자도구에서 실행.
 */

const HOST = "https://safety.kyonggi.ac.kr";
const REQUEST_GAP = 600;

function dict2query(arg) {
    return Object.entries(arg).map(e => e.join('=')).join('&');
}

function get_lecture_list() {
    /* 수강해야하는 모든 강의 ID를 구하는 함수 */
    const pattern = new RegExp('\\((\\d+)\\)');
    lecture_list = $('input.courseBtn').map(function(i, e) {
        return pattern.exec($(e).attr('onclick'))[1]; 
    }).toArray();
    return lecture_list;
}

function req_total_page(lecture_num) {
    /* 수강해야하는 총 페이지 수 구하는 함수 */
    const pattern = new RegExp('totalPage[^\\d]+(\\d+)');
    return new Promise(function(resolve, reject) {
        var url = `${HOST}/ushm/edu/contentsViewPop.do?scheduleMemberProgressNo=${lecture_num}`;
        fetch(url).then(r=>r.text()).then(function(resp) {
            
            var total_page = pattern.exec(resp)[1];
            resolve(total_page);
        }).catch(reject);
    });
}

function req_finish(lecture_num, page_num) {
    /* 수강이 끝났다고 요청하는 함수 */
    return new Promise(function(resolve, reject) {
        var url = `${HOST}/ushm/edu/SetImgtechContents2019AfterVersionProcessUpdate.do`;
        var arg = {
            'scheduleMemberProgressNo': lecture_num,
            'watchedpage': page_num,
            'gapTime': 1000
        };

        fetch(url, {
            method: 'POST',
            body: dict2query(arg),
            headers: {
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
            }
        }).then(r => r=>r.json()).then(resolve).catch(reject);
    });
}


get_lecture_list().forEach(function(lecture_num) {
    req_total_page(lecture_num).then(function(total_page) {
        let cnt = 1;
        var timer = setInterval(function() {
            req_finish(lecture_num, cnt).then(function(resp) {
                console.log(`Lecture ${lecture_num} Page ${cnt + '/' + total_page} Skip`);

                cnt += 1;
                if (cnt > total_page) {
                    clearInterval(timer);
                }
            });
        }, REQUEST_GAP);
    });
});
