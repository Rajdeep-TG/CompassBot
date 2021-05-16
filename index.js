/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
    // Your code here
    app.log.info("Yay, the app was loaded!");

    app.on("issues.opened", async(context) => {
        const issueComment = context.issue({
            body: `@${context.payload.issue.user.login} Thanks for opening this issue!`,
        });
        return context.octokit.issues.createComment(issueComment);
    });

    app.on("issues.assigned", async(context) => {
        const assignedComment = context.issue({
            body: `This issue had been assigned to @${context.payload.assignee.login}.`,
        });
        return context.octokit.issues.createComment(assignedComment);
    });

    app.on("pull_request.opened", async(context) => {
        context.log.info(context.pullRequest)
    });

    app.on("code_scanning_alert.created", async(context) => {
        const csIssue = context.issue({
            owner: "Rajdeep-TG",
            repo: context.payload.repository.name,
            body: "A New Code-Scanning Alert!"
        })
        context.octokit.issues.create(csIssue)
    })

    app.on("issues.reopened", async(context) => {
        const reComment = context.issue({
            body: `This Issue had been reopened by @${context.payload.sender.login}.`
        });
        context.octokit.issues.createComment(reComment)
        context.octokit.issues.removeAllLabels(
            context.issue({
                issue_number: context.payload.issue.number
            })
        )
        return context.octokit.issues.addLabels(
            context.issue({
                issue_number: context.payload.issue.number,
                labels: ["Reopened", "Reviewed by Compass"]
            })
        )
    });

    app.on("issues.closed", async(context) => {
        context.octokit.issues.removeAllLabels(
            context.issue({
                issue_number: context.payload.issue.number
            })
        );
        return context.octokit.issues.addLabels(
            context.issue({
                issue_number: context.payload.issue.number,
                labels: ["Closed"]
            })
        )
    })

    app.on("issues.unassigned", async(context) => {
        return context.octokit.issues.lock(
            context.issue({
                issue_number: context.payload.issue.number
            })
        );
    })

    app.on("issues.assigned", async(context) => {
        return context.octokit.issues.unlock(
            context.issue({
                issue_number: context.payload.issue.number
            })
        )
    })

    app.on("pull_request.ready_for_review", async(context) => {
        context.octokit.pulls.createReviewComment(
            context.pullRequest({
                pull_number: context.payload.pull_request.number,
                body: "This Pull is reviewed by CompassBot."
            })
        )
        return context.octokit.pulls.submitReview(
            context.pullRequest({
                pull_number: context.payload.pull_request.number
            })
        )
    })

    // For more information on building apps:
    // https://probot.github.io/docs/

    // To get your app running against GitHub, see:
    // https://probot.github.io/docs/development/
};