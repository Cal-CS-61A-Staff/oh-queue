import csv

def finding_file():
    fname = input('Enter file name: ')
    try:
        fhand = open(fname)
        return fhand
    except:
        print('Failed to find file', fname + '. Please try again.')
        return finding_file()

def estimatedTimeCalculation(file):
    sum = 0
    count = 0
    for line in file:
        #print(line)
        line_modified = line.rstrip()
        list = line.split(",")
        if list[4] == "resolved":
            if (list[2].split("T")[0].split("-")[0] == "2019"):
                if (list[2].split("T")[0] == list[5].split("T")[0]):
                    startTime = list[2].split("T")[1].split(".")[0].split(":")
                    #print(startTime)
                    resolvedTime = list[5].split("T")[1].split(".")[0].split(":")
                    #print(resolvedTime)
                    waitTime = (int(resolvedTime[0]) * 3600 + int(resolvedTime[1]) * 60 + int(resolvedTime[2]) - (int(startTime[0]) * 3600 + int(startTime[1]) * 60 + int(startTime[2])))
                    if ((waitTime / 60) < 60):
                        print(waitTime/60)
                        sum += waitTime/60
                        count += 1


    return sum / count


handle = finding_file()
print(estimatedTimeCalculation(handle))





    #The current wait time is a 75% confidence interval with a hardcoded expected avgHelpTime = 10 (minutes)
    #divided by the number of staff available. Empirically we've found that this causes the interval to fluctuate a little too much.
    #To see this, try varying the number of online assistants. We should develop a better way of calculating this
    #and perhaps estimating parameters based on data instead of magic numbers.
