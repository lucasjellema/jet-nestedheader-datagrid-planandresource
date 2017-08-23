/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';

/**
 * Example of Require.js boostrap javascript
 */

requirejs.config(
    {
        baseUrl: 'js',

        // Path mappings for the logical module names
        // Update the main-release-paths.json for release mode when updating the mappings
        paths:
        //injector:mainReleasePaths

        {
            'knockout': 'libs/knockout/knockout-3.4.0.debug',
            'jquery': 'libs/jquery/jquery-3.1.1',
            'jqueryui-amd': 'libs/jquery/jqueryui-amd-1.12.0',
            'promise': 'libs/es6-promise/es6-promise',
            'hammerjs': 'libs/hammer/hammer-2.0.8',
            'ojdnd': 'libs/dnd-polyfill/dnd-polyfill-1.0.0',
            'ojs': 'libs/oj/v3.2.0/debug',
            'ojL10n': 'libs/oj/v3.2.0/ojL10n',
            'ojtranslations': 'libs/oj/v3.2.0/resources',
            'text': 'libs/require/text',
            'signals': 'libs/js-signals/signals',
            'customElements': 'libs/webcomponents/CustomElements',
            'proj4': 'libs/proj4js/dist/proj4-src',
            'css': 'libs/require-css/css',
            'mylib': 'mylibs'
        }

        //endinjector
        ,
        // Shim configurations for modules that do not expose AMD
        shim:
        {
            'jquery':
            {
                exports: ['jQuery', '$']
            }
        }
    }
);

/**
 * A top-level require call executed by the Application.
 * Although 'ojcore' and 'knockout' would be loaded in any case (they are specified as dependencies
 * by the modules themselves), we are listing them explicitly to get the references to the 'oj' and 'ko'
 * objects in the callback
 */
require(['ojs/ojcore', 'knockout', 'appController', 'mylib/mydata', 'ojs/ojknockout', 'ojs/ojbutton', 'ojs/ojtoolbar', 'ojs/ojmenu', 'promise',
    'ojs/ojdatagrid', 'ojs/ojdatasource-common'],
    function (oj, ko, app, mydata) { // this callback gets executed when all required modules are loaded

        /**
         * Create a custom data source requires implementing each method 
         * defined in oj.DataGridDataSource. A NxM grid will be created. 
         * Row headers with label rN, column headers cM, and cells, N,M.
         * 
         * @constructor 
         * @extends oj.DataGridDataSource
         * @param {type} rowCount the number of rows to create
         * @param {type} colCount the number of columns to create
         * @returns {NestedHeaderDataGridDataSource}
         */
        function NestedHeaderDataGridDataSource(rowCount, colCount, months, employees, grid, columnHeaders) {
            this.rowCount = rowCount;
            this.colCount = colCount;
            this.months = months;
            this.employees = employees;
            this.grid = grid;
            this.columnHeaders = columnHeaders;
            NestedHeaderDataGridDataSource.superclass.constructor.call(this);
        };

        // Subclass from oj.DataGridDataSource
        oj.Object.createSubclass(NestedHeaderDataGridDataSource,
            oj.DataGridDataSource, "oj.NestedHeaderDataGridDataSource");

        /**
         * Returns the total number of rows or columns.
         * @param {string} axis the axis in which we inquire for the total 
         *                 count valid values are "row" and "column".
         * @return {number} the total number of rows/columns.
         */
        NestedHeaderDataGridDataSource.prototype.getCount = function (axis) {
            if (axis == "column") {
                return this.colCount;
            }
            else if (axis == "row") {
                return this.rowCount;
            }
            return 0;
        };

        /**
         * Fetch a range of headers from the data source. Need to pass a 
         * HeaderSet back using the callbacks.success property
         * 
         * @param {Object} headerRange information about the header range, it 
         *                 must contain the following properties: axis, 
         *                 start, count.
         * @param {Object} callbacks the callbacks to be invoke when fetch 
         *                 headers operation is completed. The valid 
         *                 callback types are "success" and "error".
         * @param {Object=} callbackObjects the object in which the callback 
         *        function is invoked on. This is optional. You can specify the
         *        callback object for each callbacks using the "success" and 
         *        "error" keys.
         */
        NestedHeaderDataGridDataSource.prototype.fetchHeaders = function (
            headerRange, callbacks, callbackObjects) {
            var axis = headerRange.axis;
            var start = headerRange.start;
            var count = headerRange.count;
            var end = start;

            if (axis === "column") {
                end = Math.min(start + count - 1, this.colCount - 1);
            }
            else if (axis === "row") {
                end = Math.min(start + count - 1, this.rowCount - 1);
            }
            //create a headerSet 
            var headerSet = new NestedHeaderSet(axis, start, end, this.months, this.employees, this.columnHeaders);
            callbacks['success'].call(callbackObjects['success'], headerSet,
                headerRange, null);
        };

        /**
         * Fetch a range of cells from the data source. Need to pass a CellSet 
         * back using the callbacks.success property
         * 
         * @param {Array.<Object>} cellRange Information about the cell range. 
         *        A cell range is defined by an array of range info for each 
         *        axis, where each range contains three properties: axis, 
         *        start, count.
         * @param {Object} callbacks the callbacks to be invoke when fetch 
         *        cells operation is completed.  The valid callback types 
         *        are "success" and "error".
         * @param {Object=} callbackObjects the object in which the callback 
         *        function is invoked on.  This is optional. You can specify 
         *        the callback object for each callbacks using the "success" 
         *        and "error" keys.
         */
        NestedHeaderDataGridDataSource.prototype.fetchCells = function (cellRanges,
            callbacks, callbackObjects) {
            // if there is no range specified then signal an error
            if (cellRanges === null || cellRanges.length < 2) {
                callbacks['error'].call(callbackObjects['error'], cellRanges);
            }

            for (var i = 0; i < cellRanges.length; i++) {
                var cellRange = cellRanges[i];
                if (cellRange['axis'] === "row") {
                    var rowStart = cellRange['start'];
                    var rowCount = cellRange['count'];
                }
                else if (cellRange['axis'] === "column") {
                    var colStart = cellRange['start'];
                    var colCount = cellRange['count'];
                }
            }

            var rowEnd = Math.min(rowStart + rowCount - 1, this.rowCount - 1);
            var colEnd = Math.min(colStart + colCount - 1, this.colCount - 1);

            if (rowEnd == -1) {
                colEnd = -1;
            }
            else if (colEnd == -1) {
                rowEnd = -1;
            }

            var cellSet = new NestedCellSet(rowStart, rowEnd, colStart,
                colEnd, this.grid);
            callbacks['success'].call(callbackObjects['success'], cellSet,
                cellRanges);
        };

        /**
         * Returns the keys based on the indexes. 
         * @param {Object} indexes the index for each axis
         * @return {Object.<Object, Object>} an object containing the keys for 
         *                                   each axis
         * @export
         */
        NestedHeaderDataGridDataSource.prototype.keys = function (indexes) {
            var rowIndex = indexes['row'];
            var columnIndex = indexes['column'];
            return { "row": "r" + rowIndex, "column": "c" + columnIndex };
        };

        /**
         * Determines whether this DataGridDataSource supports certain feature.
         * @param {string} feature the feature in which its capabilities is inquired.  Currently the only valid feature is "sort".
         * @return {string|null} the name of the feature.  For "sort", the valid return values are: "full", "none", "row", "column".  
         *         For "move", the valid return values are: "row", "none".  
         *         Returns null if the feature is not recognized.
         */
        NestedHeaderDataGridDataSource.prototype.getCapability = function (feature) {
            return null;
        };

        /**
        * Returns whether the total count returned in getCount function is an actual or an estimate.
        * @param {string} axis the axis in which we inquire whether the total count is an estimate.  Valid values are 
        *        "row" and "column".
        * @return {string} "exact" if the count returned in getCount function is the actual count, "estimate" if the 
        *         count returned in getCount function is an estimate.  The default value is "exact".
        */
        NestedHeaderDataGridDataSource.prototype.getCountPrecision = function (axis) {
            return "exact";
        };

        /**
         * Create a headerSet to pass back in the fetchHeaders callback.
         * Modifying the headerSet implementation will allow you to create 
         * nested headers. Specify return values in getDepth, getExtent, 
         * and getLevelCount to build a nested header structure.
         */
        function NestedHeaderSet(axis, start, end, months, employees, columnHeaders) {
            this.axis = axis;
            this.start = start;
            this.end = end;
            this.months = months;
            this.employees = employees;
            this.columnHeaders = columnHeaders;
        };

        /**
         * Gets the data of the specified index.  An error is throw when 1) the 
         * range is not yet available and 2) the index specified is out of 
         * bounds. 
         * @param {number} index the absolute index of the header in which we 
         *                 want to retrieve the header from.  
         * @param {number=} level the level of the header, 0 is the outermost 
         *                  header and increments by 1 moving inward
         * @return {Object} the data object for the specific index.
         */
        NestedHeaderSet.prototype.getData = function (index, level) {
            var start = this._getStartIndex(index, level);

            if (this.axis === 'row') {
                // find employee with sequence index
                return Object.keys(this.employees)[index];
            }
            else if (this.axis === 'column') {
                var header = this.columnHeaders[index];
                if (level == 0) {
                    return this.months[header.month].name;
                }
                if (level == 1) {
                    return this.months[header.month].weeks[header.week].week;
                }
                if (level == 2) {
                    return this.months[header.month].weeks[header.week].days[header.day].name;
                }
                return 'Col' + start + 'Lev' + level;
            }
            return null;
        };

        /**
         * Gets the metadata of the specified index.  An error is throw when 1) 
         * the range is not yet available and 2) the index specified is out of 
         * bounds. The metadata that the data source can optionally return are:
         *  1) sortDirection - the initial sort direction of the header. Valid 
         *                  values are "ascending" and "descending".
         *  2) key - the key of the row/column header.
         * @param {number} index the absolute index of the header in which we 
         *                  want to retrieve the metadata from.  
         * @param {number=} level the level of the header, 0 is the outermost 
         *                  header and increments by 1 moving inward
         * @return {Object} the metadata object for the specific index.
         */
        //TODO
        NestedHeaderSet.prototype.getMetadata = function (index, level) {
            var start = this._getStartIndex(index, level);

            if (this.axis === 'row') {
                return this.getLevelCount() - 1 === level ? { 'key': 'r' + start } :
                    { 'key': 'r' + start + 'L' + level };
            }
            else if (this.axis === 'column') {
                return this.getLevelCount() - 1 === level ? { 'key': 'c' + start } :
                    { 'key': 'c' + start + 'L' + level };
            }
            return null;
        };

        /**
         * Gets the actual count of the result set, the total indexes spanned 
         * by the headerSet along the innermost header.
         * @return {number} the actual count of the result set.  
         */
        NestedHeaderSet.prototype.getCount = function () {
            return this.end - this.start + 1;
        };

        /**
         * Gets the actual number of levels of the result set for the 
         * specified axis. The levels are the counted from the outermost 
         * header indexed at 0, and moving inwards toward the databody would 
         * increment the level by 1.
         * @return {number} the number of levels of the result set
         */
        NestedHeaderSet.prototype.getLevelCount = function () {
            if (this.getCount() > 0) {
                if ('row' == this.axis)
                    return 1;
                else
                    return 3;
            }
            return 0;
        };

        /**
         * Gets the extent of an index on a particular level within the context 
         * of the headerSet. Extent is defined as the number of indexes covered 
         * by the header. If the extent extends beyond the start and end of the 
         * requested range the extent should be trimmed to the edge of the 
         * requested range and the object for {'more': {before, after}} should 
         * have the value appropriate boolean set. For innermost headers the 
         * extent will always be 1.
         * @param {number} index the absolute index along the innermost header 
         *      of the extent to get, 0 is the first header in the data source
         * @param {number=} level the level of the header, 0 is the outermost 
         *      header and increments by 1 moving inward
         * @return {Object} an object containing two values
         *      extent: the number of absolute indexes spanned by the header 
         *              at this index bounded by the edges of the result set 
         *              for the specified axis. 
         *      more: object with keys 'before'/'after' and boolean values 
         *            true/false representing whether there are more indexes 
         *            before/after what is in the headerSet
         */
        NestedHeaderSet.prototype.getExtent = function (index, level) {
            var extent, start, end, before, after;
            var header = this.columnHeaders[index];
            if (level == 0) {
                start = this.months[header.month].seq;
                extent = this.months[header.month].endSeq - start;

            }
            else if (level == 1) {
                start = this.months[header.month].weeks[header.week].seq;
                extent = this.months[header.month].weeks[header.week].endSeq - start;
            }
            else {
                //extent of 1 on days
                extent = 1;
                start = index;
            }

            end = start + extent - 1;
            before = index > start;
            after = index < start + extent - 1;

            if (start < this.start) {
                // Need to subtract this overage from the extent
                extent -= (this.start - start);
            }
            if (end > this.end) {
                // true extent overruns the header set--adjust it down by that much
                extent -= (end - this.end);
            }
            return { 'extent': extent, 'more': { 'before': before, 'after': after } };
        };

        /**
         * Gets the depth of an index starting at a particular level. The depth 
         * is the number of levels spanned by the header.
         * @param {number} index the absolute index of the depth to get
         * @param {number=} level the level of the header, 0 is the outermost 
         *      header
         * @return {number} the number of levels spanned by the header at the 
         *      specified position
         */
        NestedHeaderSet.prototype.getDepth = function (index, level) {
            return 1;
        };

        /**
         * Helper method to get the start index of the header
         * @param {number} index the absolute index of the depth to get
         * @param {number=} level the level of the header, 0 is the outermost 
         *      header
         * @return {number} the start index of the header
         */
        NestedHeaderSet.prototype._getStartIndex = function (index, level) {
            if (level === 0) {
                return (index - (index % 6));
            }
            else if (level === 1) {
                return (index - (index % 3));
            }
            return index;
        };

        function NestedCellSet(startRow, endRow, startCol, endCol, grid) {
            this.startRow = startRow;
            this.endRow = endRow;
            this.startCol = startCol;
            this.endCol = endCol;
            this.grid = grid;
        };

        NestedCellSet.prototype.getData = function (indexes) {
            var cellValue = '';
            if (this.grid[indexes.row] && this.grid[indexes.row][indexes.column]) {
                var cell = this.grid[indexes.row][indexes.column];
                if (cell.activity)
                    cellValue = cell.activity;
                else
                    cellValue = cell.planned + "/" + cell.available;
            }
            return cellValue;
        };

        // TODO
        NestedCellSet.prototype.getMetadata = function (indexes) {
            var keys = {
                'row': 'r' + indexes.row,
                'column': 'c' + indexes.column
            };
            return { 'keys': keys };
        };

        NestedCellSet.prototype.getStart = function (axis) {
            if (axis === "row") {
                return this.m_startRow;
            }

            if (axis === "column") {
                return this.m_startCol;
            }
            return 0;
        };

        NestedCellSet.prototype.getCount = function (axis) {
            if (axis === 'row') {
                return this.endRow - this.startRow + 1;
            }
            else if (axis === 'column') {
                return this.endCol - this.startCol + 1;
            }
            return 0;
        };



        //Knockout model to bind to the grid
        function dataGridModel(rowCount, colCount, months, employees, grid, columnHeaders) {
            this.data = new NestedHeaderDataGridDataSource(rowCount, colCount, months, employees, grid, columnHeaders);
            this.rowHeaderRenderer = function (headerContext) {
                // container div to rotate the text
                var container = document.createElement('div');
                if (headerContext['level'] != 2) {
                    container.className = 'demo-content-container';
                }
                container.appendChild(
                    document.createTextNode(headerContext['data']));
                return container;
            };
            this.rowHeaderStyle = function (headerContext) {
                if (headerContext['level'] != 2) {
                    return 'width:2.25em;height:4.166em';
                }
            }
            var smQuery = oj.ResponsiveUtils.getFrameworkQuery(
                oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);

            this.small = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);

            // if used, should return the string with the textual value for  the cell
            // or a DOM element of the content inside the data body cell.
            // http://www.oracle.com/webfolder/technetwork/jet/jsdocs/oj.ojDataGrid.html#cell.renderer
            this.cellRenderer = function (cellContext) {
            };

            this.setCellClass = function (cellContext) {
                var row = cellContext.indexes.row;
                var col = cellContext.indexes.column;
                var cell = cellContext.datasource.grid[row][col];
                if (cell) {
                    if (cell.activity) {
                       if ('Break' === cell.activity) return " break-style";
                    } else {
                        if (cell.planned > 4) return 'green-style';
                    }
                }
                return '';
            };
        }//dataGridModel

        function prepareModelFromRawCells(mydata) {
            var dm = {};
            console.log(mydata);
            var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'Oct', 'November', 'December'];
            var weekdays = [{ "name": "M" }, { "name": "T" }, { "name": "W", seq: null }, { "name": "T", seq: null }, { "name": "F", seq: null }, { "name": "S", seq: null }, { "name": "S", seq: null }];
            // extract from data set
            // - level 0 column headings: month
            // - level 1 column headings: week
            // - level 2 column headings: day (convert day number to day letter = 0=M, 1=T .. 6=S)
            // - level 0 row heading: name
            // note: the number of columns follows from the months and weeks - assuming 7 columns per week
            // find all distinct month values and sort
            // find all distinct week values per month
            // add 7 distinct day values to month
            var months = {};
            var employees = {};
            var columnHeaders = []; // array of header objects for each column {month, week, day}
            for (var i = 0; i < mydata.cells.length; i++) {
                var cell = mydata.cells[i];
                if (!employees[cell.name]) {
                    employees[cell.name] = { "name": cell.name };
                }
                if (!months[cell.month]) {
                    months[cell.month] = { "name": monthNames[cell.month - 1], "weeks": {}, "month": cell.month };
                }

                if (!months[cell.month].weeks[cell.week]) {
                    // assign deep clone of array https://stackoverflow.com/questions/42523881/how-to-clone-a-javascript-array-of-objects
                    months[cell.month].weeks[cell.week] = { "days": JSON.parse(JSON.stringify(weekdays)), "startDate": "20170102", "week": cell.week };
                }

            }//for

            console.log(months);
            console.log(employees);
            // determine sequence number for each element in months hierarchy; highest sequence number == total number of columns
            console.log("Number of rows == number of employees ==" + Object.keys(employees).length);
            console.log(Object.keys(months));
            // loop over months, weeks, days to assign the column sequence number for each day
            var seq = 0;
            for (var month in months) {
                console.log("Month " + months[month].name);
                months[month].seq = seq;
                for (var week in months[month].weeks) {
                    console.log("Week " + months[month].weeks[week].week);
                    months[month].weeks[week].seq = seq;
                    for (var day in months[month].weeks[week].days) {
                        columnHeaders.push({ "month": month, "week": week, "day": day });
                        months[month].weeks[week].days[day]['seq'] = seq++;
                        console.log("Day " + months[month].weeks[week].days[day].name + months[month].weeks[week].days[day]['seq']);
                    }// weeks
                    months[month].weeks[week].endSeq = seq;
                }// weeks
                months[month].endSeq = seq;
            }// months

            // value of seq is the number of columns in the grid
            // loop over employees to assign the row sequence number for each employee
            var empseq = 0;
            for (var employee in employees) {
                console.log("Employee " + employees[employee].name);
                employees[employee].seq = empseq++;
            }// employees
            // value of empseq is the number of rows in the grid

            var grid = new Array(empseq);
            // for each employee, assign an array of empty placeholders with the length of seq
            for (var i = 0; i < grid.length; i++) {
                grid[i] = new Array(seq);
            }
            // iterate once more over all cells; assign each cell to a spot in the grid
            for (var i = 0; i < mydata.cells.length; i++) {
                var cell = mydata.cells[i];
                var row = employees[cell["name"]].seq;
                var col = months[cell.month].weeks[cell.week].days[cell.day]['seq'];
                grid[row][col] = cell;
            }//for
            console.log(grid);

            dm.seq = seq;
            dm.empseq = empseq;
            dm.employees = employees;
            dm.months = months;
            dm.grid = grid;
            dm.columnHeaders = columnHeaders;
            return dm;
        }// prepareModelFromRawCells

        $(function () {

            function init() {
                var datamodel = prepareModelFromRawCells(mydata);

                // create the new dataGridModel, passing the data read from module mylibs/mydata
                ko.applyBindings(new dataGridModel(datamodel.empseq, datamodel.seq, datamodel.months, datamodel.employees, datamodel.grid, datamodel.columnHeaders),
                    document.getElementById('datagrid'));
            }

            // If running in a hybrid (e.g. Cordova) environment, we need to wait for the deviceready 
            // event before executing any code that might interact with Cordova APIs or plugins.
            if ($(document.body).hasClass('oj-hybrid')) {
                document.addEventListener("deviceready", init);
            } else {
                init();
            }

        });

    }
);
