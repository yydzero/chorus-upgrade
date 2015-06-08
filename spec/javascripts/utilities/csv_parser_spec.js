describe("chorus.utilities.CsvParser", function() {
    beforeEach(function() {
        this.options = {};

        this.contents = [
            "col1,col2,col3",
            "row1val1,row1val2,row1val3",
            "row2val1,row2val2,row2val3"
        ];
    });

    context("#generateColumnNames", function() {
        it("generates column_1, column_2, ...", function() {
            var csvParser = new chorus.utilities.CsvParser(this.contents, this.options);
            expect(csvParser.generateColumnNames()).toEqual(['column_1', 'column_2', 'column_3']);
        });
    });

    context("#parseColumnNames", function() {
        it("gets the first row as the header", function() {
            var csvParser = new chorus.utilities.CsvParser(this.contents, this.options);
            expect(csvParser.parseColumnNames()).toEqual(['col1', 'col2', 'col3']);
        });
    });

    context("#getColumnOrientedData", function() {
        function itParsesCorrectly() {
            describe("getColumnOrientedData", function() {
                beforeEach(function() {
                    this.csvParser = new chorus.utilities.CsvParser(this.contents, this.options);

                    this.columns = this.csvParser.getColumnOrientedData();
                    this.types = _.pluck(this.columns, "type");
                });

                it("has the correct number of columns", function() {
                    expect(this.columns.length).toBe(this.expectedColumns.length);
                });

                it("has the column name", function() {
                    expect(this.columns[0].name).toBe(this.expectedColumns[0].name);
                });

                it("has the correct number of data types", function() {
                    expect(this.types).toEqual(_.pluck(this.expectedColumns, "type"));
                });

                it("has the rows", function() {
                    _.each(this.columns, _.bind(function(column, i) {
                        expect(column.values).toEqual(this.expectedColumns[i].values);
                    }, this));
                });
            });
        }

        context("with comma delimiters", function() {
            beforeEach(function() {
                this.contents = [
                    "col1,col2,col3",
                    "row1val1,row1val2,row1val3",
                    "row2val1,row2val2,row2val3"
                ];

                this.expectedColumns = [
                    {name: 'col1', values: ['row1val1', 'row2val1'], type: 'text'},
                    {name: 'col2', values: ['row1val2', 'row2val2'], type: 'text'},
                    {name: 'col3', values: ['row1val3', 'row2val3'], type: 'text'}
                ];
            });

            itParsesCorrectly();
        });

        context("with space delimiters", function() {
            beforeEach(function() {
                this.contents = [
                    'col1 col2 col3',
                    '"row1 val1" row1val2 row1val3',
                    'row2val1 "row2 val2" row2val3'
                ];

                this.expectedColumns = [
                    {name: 'col1', values: ['row1 val1', 'row2val1'], type: 'text'},
                    {name: 'col2', values: ['row1val2', 'row2 val2'], type: 'text'},
                    {name: 'col3', values: ['row1val3', 'row2val3'], type: 'text'}
                ];
                this.options.delimiter = ' ';
            });

            itParsesCorrectly();
        });

        context("with tab delimiters", function() {
            beforeEach(function() {
                this.contents = [
                    "col1\tcol2\tcol3",
                    "row1val1\trow1val2\trow1val3",
                    "row2val1\trow2val2\trow2val3"
                ];

                this.expectedColumns = [
                    {name: 'col1', values: ['row1val1', 'row2val1'], type: 'text'},
                    {name: 'col2', values: ['row1val2', 'row2val2'], type: 'text'},
                    {name: 'col3', values: ['row1val3', 'row2val3'], type: 'text'}
                ];
                this.options.delimiter = '\t';
            });

            itParsesCorrectly();
        });

        context("with quoted comma", function() {
            beforeEach(function() {
                this.contents = [
                    'col1,col2,col3',
                    '"row1,val1",row1val2,row1val3',
                    'row2val1,"row2,val2",row2val3'
                ];

                this.expectedColumns = [
                    {name: 'col1', values: ['row1,val1', 'row2val1'], type: 'text'},
                    {name: 'col2', values: ['row1val2', 'row2,val2'], type: 'text'},
                    {name: 'col3', values: ['row1val3', 'row2val3'], type: 'text'}
                ];
            });

            itParsesCorrectly();
        });

        context("with escaped quote", function() {
            beforeEach(function() {
                this.contents = [
                    'col1,col2,col3',
                    '"row1""val1",row1val2,""""',
                    'row2val1,"row2val2",row2val3'
                ];

                this.expectedColumns = [
                    {name: 'col1', values: ['row1"val1', 'row2val1'], type: 'text'},
                    {name: 'col2', values: ['row1val2', 'row2val2'], type: 'text'},
                    {name: 'col3', values: ['"', 'row2val3'], type: 'text'}
                ];
            });

            itParsesCorrectly();
        });

        context("with empty values", function() {
            beforeEach(function() {
                this.contents = [
                    'col1,col2,col3',
                    '"row1""val1",row1val2,',
                    'row2val1,,row2val3'
                ];


                this.expectedColumns = [
                    {name: 'col1', values: ['row1"val1', 'row2val1'], type: 'text'},
                    {name: 'col2', values: ['row1val2', ''], type: 'text'},
                    {name: 'col3', values: ['', 'row2val3'], type: 'text'}
                ];
            });

            itParsesCorrectly();
        });

        context("with unparseable values (for current delimiter)", function() {
            beforeEach(function() {
                this.contents = [
                    '"col1 ""colly"" column",col2,col3',
                    '"row1""val1",row1val2,',
                    'row2val1,,row2val3'
                ];

                this.options.delimiter = ' ';

                this.csvParser = new chorus.utilities.CsvParser(this.contents, this.options);
            });

            it("returns an empty array and sets serverErrors", function() {
                var columns = this.csvParser.getColumnOrientedData();
                expect(columns).toEqual([]);
                expect(_.keys(this.csvParser.serverErrors).length).toBe(1);
            });
        });

        context("datatypes", function() {
            beforeEach(function() {
                this.contents = [
                    'col1,empty,col2,someText,col3,someDouble,col4',
                    'foo,  ,2,abc,3, ,1/2/3',
                    'bar, ,2.1, ,sna,1,456'
                ];

                this.expectedColumns = [
                    {name: 'col1', values: ['foo', 'bar'], type: 'text'},
                    {name: 'empty', values: ['  ', ' '], type: 'text'},
                    {name: 'col2', values: ['2', '2.1'], type: 'double_precision'},
                    {name: 'someText', values: ['abc', ' '], type: 'text'},
                    {name: 'col3', values: ['3', 'sna'], type: 'text'},
                    {name: 'someDouble', values: [' ', '1'], type: 'double_precision'},
                    {name: 'col4', values: ['1/2/3', '456'], type: 'text'}
                ];
            });

            itParsesCorrectly();
        });

        context("when types are specified", function() {
            beforeEach(function() {
                this.options.types = ['integer', 'text', 'double precision'];
                this.contents = [
                    "col1,col2,col3",
                    "row1val1,row1val2,row1val3",
                    "row2val1,row2val2,row2val3"
                ];

                this.expectedColumns = [
                    {name: 'col1', values: ['row1val1', 'row2val1'], type: 'integer'},
                    {name: 'col2', values: ['row1val2', 'row2val2'], type: 'text'},
                    {name: 'col3', values: ['row1val3', 'row2val3'], type: 'double precision'}
                ];
            });

            itParsesCorrectly();
        });

        context("when some types are specified", function() {
            beforeEach(function() {
                this.options.types = ['integer'];
                this.contents = [
                    "col1,col2,col3",
                    "row1val1,row1val2,row1val3",
                    "row2val1,row2val2,row2val3"
                ];

                this.expectedColumns = [
                    {name: 'col1', values: ['row1val1', 'row2val1'], type: 'text'},
                    {name: 'col2', values: ['row1val2', 'row2val2'], type: 'text'},
                    {name: 'col3', values: ['row1val3', 'row2val3'], type: 'text'}
                ];
            });

            itParsesCorrectly();
        });

        context("no header row", function() {
            beforeEach(function() {
                this.contents = [
                    'foo,2,3,1/2/3',
                    'bar,2.1,sna,456'
                ];

                this.expectedColumns = [
                    {name: 'column_1', values: ['foo', 'bar'], type: 'text'},
                    {name: 'column_2', values: ['2', '2.1'], type: 'double_precision'},
                    {name: 'column_3', values: ['3', 'sna'], type: 'text'},
                    {name: 'column_4', values: ['1/2/3', '456'], type: 'text'}
                ];

                this.options.hasHeader = false;
            });

            itParsesCorrectly();
        });

        describe("it retains values the user has overridden", function() {
            beforeEach(function() {
                this.contents =  [
                    'col1,col2,col3,col4',
                    'foo,2,3,1/2/3',
                    'bar,2.1,sna,456'
                ];
            });

            it("stores changes to the generated column names", function() {
                this.options.hasHeader = false;
                this.options.columnNameOverrides = ["ggg", "ttt", "rrr", "eee"];

                var csvParser = new chorus.utilities.CsvParser(this.contents, this.options);
                var columnData = csvParser.getColumnOrientedData();
                var columnNames = _.pluck(columnData, "name");

                expect(columnNames).toEqual(["ggg", "ttt", "rrr", "eee"]);
                expect(columnData[0].values.length).toBe(3);
            });

            it("stores changes to the header column names from the file", function() {
                this.options.hasHeader = true;
                this.options.columnNameOverrides = ["f", "d", "s", "a"];

                var csvParser = new chorus.utilities.CsvParser(this.contents, this.options);
                var columnData = csvParser.getColumnOrientedData();
                var columnNames = _.pluck(columnData, "name");

                expect(columnNames).toEqual(["f", "d", "s", "a"]);
                expect(columnData[0].values.length).toBe(2);
            });
        });
    });

    var itNormalizesNames = function(normalizer) {
        it("converts spaces to underscores", function() {
            expect(normalizer("file name")).toBe("file_name");
        });

        it("converts periods to underscores", function() {
            expect(normalizer("file.name")).toBe("file_name");
        });

        it("discards invalid characters", function() {
            expect(normalizer("file^$name*&22_+33")).toBe("filename22_33");
        });

        it("converts uppercase to lowercase", function() {
            expect(normalizer("ABC")).toBe("abc");
        });

        it("trims the white spaces", function() {
            expect(normalizer(" file^$name* &22_+33 ")).toBe("filename_22_33");
        });

        it("truncates at 64 characters", function() {
            expect(normalizer("0123456789012345678901234567890123456789012345678901234567890123456789")).toBe("0123456789012345678901234567890123456789012345678901234567890123");
        });
    };

    describe("#normalizeForDatabase", function() {
        itNormalizesNames(chorus.utilities.CsvParser.normalizeForDatabase);
    });

    describe("#normalizeColumnName", function() {

        it("converts to lower case", function() {
            expect(chorus.utilities.CsvParser.normalizeColumnName("FILENAME")).toBe("filename");
        });

        itNormalizesNames(chorus.utilities.CsvParser.normalizeColumnName);
    });
});
